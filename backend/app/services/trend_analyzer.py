def analyze_trend(values: list):
    if len(values) < 2:
        return {
            "trend": "NOT_ENOUGH_DATA",
            "message": "At least two results are needed to detect a trend."
        }

    first_value = values[0]
    last_value = values[-1]

    if last_value > first_value:
        trend = "INCREASING"
        message = "Values are increasing over time."
    elif last_value < first_value:
        trend = "DECREASING"
        message = "Values are decreasing over time."
    else:
        trend = "STABLE"
        message = "Values are stable over time."

    return {
        "trend": trend,
        "message": message
    }