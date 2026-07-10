"""
NLQ Service — Phase 9: Premium Features

A deterministic, rule-based Natural Language Query engine.
No external LLM. Converts natural language into structured dashboard operations.

Pipeline: tokenize → normalize → intent_match → entity_extract → operation_build → chart_recommend
"""
from __future__ import annotations

import re
import time
from typing import Any, Dict, List, Optional
import structlog

from app.schemas.premium import NLQOperation, NLQRequest, NLQResponse, NLQResult

logger = structlog.get_logger(__name__)

# ─── Intent Patterns ─────────────────────────────────────────────────────────

_INTENTS: List[Dict[str, Any]] = [
    # top N  —  "top 5 customers", "top ten products by revenue"
    {
        "id": "top_n",
        "patterns": [r"\btop\s+(\d+|ten|five|three|twenty)\b"],
        "chart_type": "bar",
        "aggregation": "sum",
    },
    # average / mean
    {
        "id": "average",
        "patterns": [r"\b(average|avg|mean)\b"],
        "chart_type": "bar",
        "aggregation": "avg",
    },
    # total / sum
    {
        "id": "sum",
        "patterns": [r"\b(total|sum|aggregate)\b"],
        "chart_type": "bar",
        "aggregation": "sum",
    },
    # count
    {
        "id": "count",
        "patterns": [r"\b(count|number of|how many)\b"],
        "chart_type": "bar",
        "aggregation": "count",
    },
    # compare
    {
        "id": "compare",
        "patterns": [r"\bcompare\b", r"\bvs\b", r"\bversus\b"],
        "chart_type": "bar",
        "aggregation": None,
    },
    # filter by date
    {
        "id": "filter_date",
        "patterns": [
            r"\b(from|in|during|for)\s+\d{4}\b",
            r"\b(january|february|march|april|may|june|july|august|september|october|november|december)\b",
            r"\b(this|last)\s+(month|year|week|quarter)\b",
        ],
        "chart_type": "line",
        "aggregation": None,
    },
    # show / display / group by  — catch-all grouping
    {
        "id": "show_by",
        "patterns": [r"\bby\b", r"\bgroup(ed)?\s+by\b", r"\bshow\b", r"\bdisplay\b", r"\bplot\b"],
        "chart_type": "bar",
        "aggregation": None,
    },
    # trend / over time
    {
        "id": "trend",
        "patterns": [r"\btrend\b", r"\bover\s+time\b", r"\bmonthly\b", r"\bweekly\b", r"\bdaily\b"],
        "chart_type": "line",
        "aggregation": None,
    },
    # distribution / spread
    {
        "id": "distribution",
        "patterns": [r"\bdistribution\b", r"\bspread\b", r"\brange\b", r"\bhistogram\b"],
        "chart_type": "histogram",
        "aggregation": None,
    },
    # proportion / share / percentage
    {
        "id": "proportion",
        "patterns": [r"\bproportion\b", r"\bshare\b", r"\bpercent(age)?\b", r"\bbreakdown\b"],
        "chart_type": "pie",
        "aggregation": None,
    },
]

_WORD_NUMBERS = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
                 "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
                 "twenty": 20, "fifty": 50, "hundred": 100}

_AGGREGATION_WORDS = {
    "total": "sum", "sum": "sum", "aggregate": "sum",
    "average": "avg", "avg": "avg", "mean": "avg",
    "count": "count", "number of": "count", "how many": "count",
    "min": "min", "minimum": "min",
    "max": "max", "maximum": "max",
}

_PREPOSITIONS = {"by", "for", "of", "in", "from", "to", "with", "on", "at", "per"}

_STOPWORDS = {
    "show", "display", "plot", "visualize", "give", "me", "the", "a", "an",
    "data", "chart", "graph", "table", "report", "get", "fetch", "list",
    "all", "each", "every", "only", "just", "please", "and", "or", "that",
    "which", "where", "when", "what", "how",
}

_MONTH_MAP = {
    "january": 1, "february": 2, "march": 3, "april": 4,
    "may": 5, "june": 6, "july": 7, "august": 8,
    "september": 9, "october": 10, "november": 11, "december": 12,
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}

_FALLBACK_SUGGESTIONS = [
    "Show sales by month",
    "Top 5 customers",
    "Average revenue by category",
    "Total orders by region",
    "Compare January and February",
    "Distribution of prices",
    "Count orders by status",
    "Revenue trend over time",
]


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _normalize(text: str) -> str:
    return text.lower().strip()


def _tokenize(text: str) -> List[str]:
    return re.split(r"[\s,]+", text)


def _parse_number(token: str) -> Optional[int]:
    if token.isdigit():
        return int(token)
    return _WORD_NUMBERS.get(token)


def _detect_intent(text: str) -> Optional[Dict[str, Any]]:
    """Returns the highest-priority matched intent."""
    for intent in _INTENTS:
        for pattern in intent["patterns"]:
            if re.search(pattern, text, re.IGNORECASE):
                return intent
    return None


def _extract_columns_heuristic(text: str) -> Dict[str, Optional[str]]:
    """
    Very simple heuristic: words after 'by' or after aggregation words are likely column names.
    Returns {x_column, y_column, group_by}.
    """
    tokens = _tokenize(text)
    clean = [t for t in tokens if t not in _STOPWORDS and len(t) > 1]

    x_col = None
    y_col = None
    group_by = None

    # Look for "X by Y" pattern
    by_idx = next((i for i, t in enumerate(tokens) if t == "by"), None)
    if by_idx is not None:
        # Y is typically after "by"
        after_by = [t for t in tokens[by_idx + 1:] if t not in _STOPWORDS and len(t) > 1]
        if after_by:
            group_by = after_by[0]
        # X is typically before "by" (excluding agg words and stopwords)
        before_by = [
            t for t in tokens[:by_idx]
            if t not in _STOPWORDS and t not in _AGGREGATION_WORDS and len(t) > 1
        ]
        if before_by:
            y_col = before_by[-1]
    elif clean:
        # Fallback: first significant word as x, second as y
        x_col = clean[0] if len(clean) > 0 else None
        y_col = clean[1] if len(clean) > 1 else None

    return {"x_column": x_col, "y_column": y_col, "group_by": group_by}


def _extract_limit(text: str) -> Optional[int]:
    m = re.search(r"\btop\s+(\d+|ten|five|three|twenty)\b", text, re.IGNORECASE)
    if m:
        raw = m.group(1)
        return _parse_number(raw) or 5
    return None


def _extract_filter_date(text: str) -> Dict[str, Any]:
    result: Dict[str, Any] = {}
    # Year filter: "from 2025" / "in 2024"
    m = re.search(r"\b(from|in|during|for)\s+(\d{4})\b", text, re.IGNORECASE)
    if m:
        result["filter_column"] = "date"
        result["filter_operator"] = "year_eq"
        result["filter_value"] = int(m.group(2))
        return result

    # Month filter: "in January" / "during March"
    for month_name, month_num in _MONTH_MAP.items():
        if re.search(rf"\b{month_name}\b", text, re.IGNORECASE):
            result["filter_column"] = "date"
            result["filter_operator"] = "month_eq"
            result["filter_value"] = month_num
            return result

    # Relative: "last month", "this year"
    m2 = re.search(r"\b(this|last)\s+(month|year|week|quarter)\b", text, re.IGNORECASE)
    if m2:
        result["filter_column"] = "date"
        result["filter_operator"] = f"{m2.group(1)}_{m2.group(2)}"
        result["filter_value"] = None

    return result


def _extract_compare_values(text: str) -> List[Any]:
    """Extracts items in "compare X and Y" patterns."""
    m = re.search(r"\bcompare\s+(.+?)\s+and\s+(.+?)(?:\s|$)", text, re.IGNORECASE)
    if m:
        return [m.group(1).strip(), m.group(2).strip()]
    return []


# ─── NLQ Engine ──────────────────────────────────────────────────────────────

class NLQService:
    def parse(self, request: NLQRequest) -> NLQResponse:
        t0 = time.perf_counter()
        text_norm = _normalize(request.query)

        intent_match = _detect_intent(text_norm)

        if not intent_match:
            elapsed = (time.perf_counter() - t0) * 1000
            logger.info("nlq_no_intent", query=request.query)
            return NLQResponse(
                result=NLQResult(
                    success=False,
                    raw_query=request.query,
                    fallback_suggestions=_FALLBACK_SUGGESTIONS[:5],
                ),
                processing_time_ms=round(elapsed, 2),
            )

        intent_id = intent_match["id"]
        chart_type = intent_match.get("chart_type", "bar")
        aggregation = intent_match.get("aggregation")

        # Extract entities
        cols = _extract_columns_heuristic(text_norm)
        limit = _extract_limit(text_norm) if intent_id == "top_n" else None
        date_filter = _extract_filter_date(text_norm) if intent_id == "filter_date" else {}
        compare_vals = _extract_compare_values(text_norm) if intent_id == "compare" else []

        # Override aggregation from text
        for word, agg in _AGGREGATION_WORDS.items():
            if word in text_norm:
                aggregation = agg
                break

        operation = NLQOperation(
            intent=intent_id,
            x_column=cols.get("x_column"),
            y_column=cols.get("y_column"),
            group_by=cols.get("group_by"),
            aggregation=aggregation,
            chart_type=chart_type,
            limit=limit,
            sort_order="desc" if intent_id == "top_n" else None,
            filter_column=date_filter.get("filter_column"),
            filter_operator=date_filter.get("filter_operator"),
            filter_value=date_filter.get("filter_value"),
            compare_values=compare_vals if compare_vals else None,
        )

        explanation = self._build_explanation(intent_id, operation)

        elapsed = (time.perf_counter() - t0) * 1000
        logger.info(
            "nlq_parsed",
            query=request.query,
            intent=intent_id,
            chart_type=chart_type,
            processing_time_ms=round(elapsed, 2),
        )

        return NLQResponse(
            result=NLQResult(
                success=True,
                intent=intent_id,
                operation=operation,
                chart_type=chart_type,
                explanation=explanation,
                raw_query=request.query,
            ),
            processing_time_ms=round(elapsed, 2),
        )

    def _build_explanation(self, intent_id: str, op: NLQOperation) -> str:
        """Generates a human-readable explanation of the parsed operation."""
        parts = []

        agg_label = {"sum": "total", "avg": "average", "count": "count",
                     "min": "minimum", "max": "maximum"}.get(op.aggregation or "", "")

        if intent_id == "top_n":
            n = op.limit or 5
            col = op.y_column or "values"
            group = op.group_by or op.x_column or "category"
            parts.append(f"Show top {n} {group} by {agg_label} {col}")
        elif intent_id in ("average", "sum", "count"):
            col = op.y_column or "values"
            group = op.group_by or op.x_column
            if group:
                parts.append(f"Calculate {agg_label} of {col} grouped by {group}")
            else:
                parts.append(f"Calculate {agg_label} of {col}")
        elif intent_id == "filter_date":
            parts.append(f"Filter data by date: {op.filter_operator} {op.filter_value or ''}")
        elif intent_id == "compare":
            vals = op.compare_values or []
            parts.append(f"Compare {' vs '.join(str(v) for v in vals)}")
        elif intent_id == "trend":
            col = op.y_column or "values"
            parts.append(f"Show {col} trend over time as a line chart")
        elif intent_id == "proportion":
            col = op.y_column or "category"
            parts.append(f"Show proportion breakdown of {col} as a pie chart")
        elif intent_id == "distribution":
            col = op.x_column or "values"
            parts.append(f"Show distribution of {col} as a histogram")
        else:
            group = op.group_by or op.x_column or "category"
            col = op.y_column or "values"
            parts.append(f"Show {col} grouped by {group}")

        chart_label = {
            "bar": "bar chart", "line": "line chart", "pie": "pie chart",
            "scatter": "scatter plot", "area": "area chart", "histogram": "histogram",
        }.get(op.chart_type or "bar", "bar chart")
        parts.append(f"Rendered as {chart_label}.")
        return " — ".join(parts)


nlq_service = NLQService()
