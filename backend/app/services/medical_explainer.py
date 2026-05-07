def explain_lab_value(test: str, value: float, normal_range: str, status: str) -> str:
    test_lower = test.lower()

    if status == "NORMAL":
        return f"Your {test} value is within the normal range."

    if test_lower == "glucose":
        if status == "HIGH":
            return "Your glucose is above the normal range. This may suggest high blood sugar and should be discussed with a doctor."
        elif status == "LOW":
            return "Your glucose is below the normal range. This may suggest low blood sugar and should be discussed with a doctor."

    if test_lower == "hemoglobin":
        if status == "HIGH":
            return "Your hemoglobin is above the normal range. This may be related to dehydration or other conditions and should be reviewed by a doctor."
        elif status == "LOW":
            return "Your hemoglobin is below the normal range. This may suggest anemia or other causes and should be discussed with a doctor."

    if test_lower == "cholesterol":
        if status == "HIGH":
            return "Your cholesterol is above the normal range. High cholesterol may increase heart-related risks and should be reviewed by a doctor."
        elif status == "LOW":
            return "Your cholesterol is below the normal range. This is less common but should still be discussed with a doctor if needed."

    if status == "HIGH":
        return f"Your {test} value is above the normal range. Please discuss this with a doctor."

    if status == "LOW":
        return f"Your {test} value is below the normal range. Please discuss this with a doctor."

    return f"Your {test} result should be reviewed with a doctor."