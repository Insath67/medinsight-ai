import re
from typing import Optional


def safe_float(value: str) -> Optional[float]:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def clean_test_name(name: str) -> str:
    name = re.sub(r"\s+", " ", name).strip(" :-")
    return name.upper()


def normalize_range_text(range_text: str) -> str:
    return re.sub(r"\s+", " ", range_text).strip()


def detect_status(value: float, normal_range: Optional[str]) -> str:
    if value is None:
        return "UNKNOWN"

    if not normal_range:
        return "UNKNOWN"

    text = normal_range.strip()

    between_match = re.search(r"(-?\d+(?:\.\d+)?)\s*[-–to]+\s*(-?\d+(?:\.\d+)?)", text, re.IGNORECASE)
    less_than_match = re.search(r"<\s*(-?\d+(?:\.\d+)?)", text)
    greater_than_match = re.search(r">\s*(-?\d+(?:\.\d+)?)", text)

    if between_match:
        low = safe_float(between_match.group(1))
        high = safe_float(between_match.group(2))

        if low is not None and value < low:
            return "LOW"
        if high is not None and value > high:
            return "HIGH"
        return "NORMAL"

    if less_than_match:
        high = safe_float(less_than_match.group(1))
        if high is not None and value >= high:
            return "HIGH"
        return "NORMAL"

    if greater_than_match:
        low = safe_float(greater_than_match.group(1))
        if low is not None and value <= low:
            return "LOW"
        return "NORMAL"

    return "UNKNOWN"


def extract_lab_values_from_text(report_text: str):
    if not report_text:
        return []

    lines = [line.strip() for line in report_text.splitlines() if line.strip()]
    extracted_results = []

    for i, line in enumerate(lines):
        normalized_line = re.sub(r"\s+", " ", line).strip()

        # Pattern 1:
        # FASTING BLOOD SUGAR (FBS)   245   70 - 100
        pattern_1 = re.search(
            r"^(?P<test>[A-Za-z0-9,\-()/ .]+?)\s+(?P<value>-?\d+(?:\.\d+)?)\s+(?P<range><\s*-?\d+(?:\.\d+)?|>\s*-?\d+(?:\.\d+)?|-?\d+(?:\.\d+)?\s*[-–to]+\s*-?\d+(?:\.\d+)?)$",
            normalized_line,
            re.IGNORECASE,
        )

        if pattern_1:
            test_name = clean_test_name(pattern_1.group("test"))
            test_value = safe_float(pattern_1.group("value"))
            normal_range = normalize_range_text(pattern_1.group("range"))

            if test_name and test_value is not None:
                extracted_results.append({
                    "test_name": test_name,
                    "value": test_value,
                    "normal_range": normal_range,
                    "status": detect_status(test_value, normal_range),
                })
                continue

        # Pattern 2:
        # GLUCOSE,RANDOM 218 mg/dl < 200 mg/dl
        pattern_2 = re.search(
            r"^(?P<test>[A-Za-z0-9,\-()/ .]+?)\s+(?P<value>-?\d+(?:\.\d+)?)\s+[A-Za-z/%]+(?:\s+(?P<range><\s*-?\d+(?:\.\d+)?|>\s*-?\d+(?:\.\d+)?|-?\d+(?:\.\d+)?\s*[-–to]+\s*-?\d+(?:\.\d+)?))?",
            normalized_line,
            re.IGNORECASE,
        )

        if pattern_2:
            test_name = clean_test_name(pattern_2.group("test"))
            test_value = safe_float(pattern_2.group("value"))
            normal_range = pattern_2.group("range")
            normal_range = normalize_range_text(normal_range) if normal_range else None

            if test_name and test_value is not None:
                extracted_results.append({
                    "test_name": test_name,
                    "value": test_value,
                    "normal_range": normal_range,
                    "status": detect_status(test_value, normal_range),
                })
                continue

        # Pattern 3:
        # Test name on one line, value + range on next line
        # Example:
        # GLUCOSE, RANDOM
        # 218 mg/dl < 200 mg/dl
        if i + 1 < len(lines):
            next_line = re.sub(r"\s+", " ", lines[i + 1]).strip()

            next_pattern = re.search(
                r"^(?P<value>-?\d+(?:\.\d+)?)\s+[A-Za-z/%]+(?:\s+(?P<range><\s*-?\d+(?:\.\d+)?|>\s*-?\d+(?:\.\d+)?|-?\d+(?:\.\d+)?\s*[-–to]+\s*-?\d+(?:\.\d+)?))?",
                next_line,
                re.IGNORECASE,
            )

            if next_pattern and len(normalized_line.split()) <= 6:
                test_name = clean_test_name(normalized_line)
                test_value = safe_float(next_pattern.group("value"))
                normal_range = next_pattern.group("range")
                normal_range = normalize_range_text(normal_range) if normal_range else None

                if test_name and test_value is not None:
                    extracted_results.append({
                        "test_name": test_name,
                        "value": test_value,
                        "normal_range": normal_range,
                        "status": detect_status(test_value, normal_range),
                    })

    # remove duplicates by test_name + value
    unique_results = []
    seen = set()

    for item in extracted_results:
        key = (item["test_name"], item["value"], item["normal_range"])
        if key not in seen:
            seen.add(key)
            unique_results.append(item)

    return unique_results