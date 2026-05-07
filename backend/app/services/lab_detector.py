import re

def detect_lab_values(report_text: str):

    patterns = [
        r"(Glucose)\s*[:\-]?\s*(\d+\.?\d*)\s*mg\/dL\s*\(?(?:Normal|Ref)?[:\s]*(\d+)\s*-\s*(\d+)\)?",
        r"(Hemoglobin)\s*[:\-]?\s*(\d+\.?\d*)\s*g\/dL\s*\(?(?:Normal|Ref)?[:\s]*(\d+)\s*-\s*(\d+)\)?",
        r"(Cholesterol)\s*[:\-]?\s*(\d+\.?\d*)\s*mg\/dL\s*\(?(?:Normal|Ref)?[:\s]*(\d+)\s*-\s*(\d+)\)?",
    ]

    results = []

    for pattern in patterns:

        matches = re.findall(pattern, report_text, re.IGNORECASE)

        for match in matches:

            test_name = match[0]
            value = float(match[1])
            low = float(match[2])
            high = float(match[3])

            if value < low:
                status = "LOW"
            elif value > high:
                status = "HIGH"
            else:
                status = "NORMAL"

            results.append({
                "test": test_name,
                "value": value,
                "normal_range": f"{low}-{high}",
                "status": status
            })

    return results