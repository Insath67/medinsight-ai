def to_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def normalize_status(status):
    if not status:
        return None
    return str(status).strip().lower()


def interpret_single_result(test_name: str, value, normal_range: str | None, status: str | None):
    status_normalized = normalize_status(status)

    severity = "unknown"
    interpretation = "No clear interpretation available."
    action = "Consult your doctor if needed."

    if status_normalized == "normal":
        severity = "normal"
        interpretation = f"{test_name} is within the normal range."
        action = "Maintain regular monitoring."
    elif status_normalized in ["low", "high"]:
        severity = "moderate"
        interpretation = f"{test_name} is {status_normalized} compared to the normal range."
        action = "Doctor review is recommended."
    elif status_normalized in ["critical low", "critical high", "critical"]:
        severity = "high"
        interpretation = f"{test_name} is critically abnormal."
        action = "Urgent doctor follow-up is recommended."
    elif status_normalized:
        severity = "abnormal"
        interpretation = f"{test_name} is abnormal."
        action = "Further medical review may be needed."

    return {
        "test_name": test_name,
        "value": value,
        "normal_range": normal_range,
        "status": status,
        "severity": severity,
        "interpretation": interpretation,
        "recommended_action": action
    }


def interpret_comparison_result(comparison_item: dict):
    test_name = comparison_item.get("test_name")
    trend = str(comparison_item.get("trend", "")).upper()
    status_change = str(comparison_item.get("status_change", "")).upper()
    new_status = normalize_status(comparison_item.get("new_status"))

    interpretation = "No comparison interpretation available."
    recommended_action = "Continue monitoring."

    if status_change == "NORMALIZED":
        interpretation = f"{test_name} has improved back into the normal range."
        recommended_action = "Continue monitoring to keep the value stable."
    elif status_change == "BECAME_ABNORMAL":
        interpretation = f"{test_name} has moved from normal to abnormal."
        recommended_action = "Doctor follow-up is recommended."
    elif trend == "INCREASED" and new_status != "normal":
        interpretation = f"{test_name} is worsening compared to the previous report."
        recommended_action = "Repeat testing or doctor review is recommended."
    elif trend == "DECREASED" and new_status != "normal":
        interpretation = f"{test_name} is improving, but it is still not fully normal."
        recommended_action = "Continue follow-up until it normalizes."
    elif trend == "UNCHANGED" and new_status == "normal":
        interpretation = f"{test_name} remains stable and normal."
        recommended_action = "Routine monitoring is enough."
    elif trend == "UNCHANGED":
        interpretation = f"{test_name} remains unchanged."
        recommended_action = "Keep monitoring and discuss with your doctor if needed."

    return {
        "test_name": test_name,
        "interpretation": interpretation,
        "recommended_action": recommended_action
    }


def build_comparison_clinical_summary(comparisons: list):
    normalized = 0
    worsened = 0
    still_abnormal = 0
    newly_abnormal = 0

    for item in comparisons:
        status_change = str(item.get("status_change", "")).upper()
        trend = str(item.get("trend", "")).upper()
        new_status = normalize_status(item.get("new_status"))

        if status_change == "NORMALIZED":
            normalized += 1
        if status_change == "BECAME_ABNORMAL":
            newly_abnormal += 1
        if trend == "INCREASED" and new_status != "normal":
            worsened += 1
        if new_status and new_status != "normal":
            still_abnormal += 1

    if normalized > 0 and worsened == 0 and newly_abnormal == 0:
        overall = "Overall, some values have improved and moved toward normal."
    elif worsened > 0 or newly_abnormal > 0:
        overall = "Overall, some markers appear to be worsening and may need medical follow-up."
    elif still_abnormal > 0:
        overall = "Some values remain abnormal and should continue to be monitored."
    else:
        overall = "Values appear relatively stable overall."

    return {
        "normalized_count": normalized,
        "worsened_count": worsened,
        "still_abnormal_count": still_abnormal,
        "newly_abnormal_count": newly_abnormal,
        "overall_interpretation": overall
    }