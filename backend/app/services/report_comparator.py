def safe_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def normalize_status(status):
    if not status:
        return None
    return str(status).strip().lower()


def normalize_test_name(name):
    if not name:
        return ""

    normalized = str(name).strip().lower()

    normalized = normalized.replace(",", " ")
    normalized = normalized.replace("_", " ")
    normalized = " ".join(normalized.split())

    # glucose / blood sugar group
    if (
        "glucose" in normalized
        or "blood sugar" in normalized
        or normalized == "fbs"
        or "fbs" in normalized
    ):
        return "glucose"

    return normalized


def compare_lab_results(old_results: list, new_results: list):
    old_map = {normalize_test_name(item["test_name"]): item for item in old_results}
    new_map = {normalize_test_name(item["test_name"]): item for item in new_results}

    common_tests = set(old_map.keys()) & set(new_map.keys())

    comparisons = []
    improved_count = 0
    worsened_count = 0
    unchanged_count = 0
    normalized_count = 0
    newly_abnormal_count = 0

    for test_key in sorted(common_tests):
        old_item = old_map[test_key]
        new_item = new_map[test_key]

        old_value = old_item.get("value")
        new_value = new_item.get("value")

        old_num = safe_float(old_value)
        new_num = safe_float(new_value)

        old_status = normalize_status(old_item.get("status"))
        new_status = normalize_status(new_item.get("status"))

        difference = None
        trend = "UNKNOWN"
        status_change = "UNCHANGED"

        if old_num is not None and new_num is not None:
            difference = round(new_num - old_num, 2)

            if difference > 0:
                trend = "INCREASED"
            elif difference < 0:
                trend = "DECREASED"
            else:
                trend = "UNCHANGED"

        if old_status == "normal" and new_status != "normal" and new_status is not None:
            status_change = "BECAME_ABNORMAL"
            newly_abnormal_count += 1
            worsened_count += 1
        elif old_status != "normal" and old_status is not None and new_status == "normal":
            status_change = "NORMALIZED"
            normalized_count += 1
            improved_count += 1
        elif old_status == new_status:
            status_change = "UNCHANGED"
            unchanged_count += 1
        else:
            status_change = "STATUS_CHANGED"
            if new_status == "normal":
                improved_count += 1
            elif old_status == "normal":
                worsened_count += 1

        comparisons.append({
            "test_name": old_item.get("test_name"),
            "normalized_test_name": test_key,
            "old_value": old_value,
            "new_value": new_value,
            "difference": difference,
            "trend": trend,
            "old_status": old_item.get("status"),
            "new_status": new_item.get("status"),
            "status_change": status_change
        })

    summary = {
        "total_compared_tests": len(comparisons),
        "improved_count": improved_count,
        "worsened_count": worsened_count,
        "unchanged_count": unchanged_count,
        "normalized_count": normalized_count,
        "newly_abnormal_count": newly_abnormal_count
    }

    return {
        "summary": summary,
        "comparisons": comparisons
    }