from math import ceil


def get_level(score):
    score = max(0, score or 0)
    level = ceil(10 / (1 + score / 500))
    return max(1, min(10, level))


def get_score_for_level(level):
    safe_level = max(1, min(10, int(level or 1)))
    if safe_level == 10:
        return 0

    score = ceil(500 * (10 / safe_level - 1))
    return max(0, score)