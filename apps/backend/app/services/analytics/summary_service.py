from typing import List
from app.schemas.analytics import ExecutiveSummary, Insight
from app.schemas.analytics import DistributionResult, OutlierResult

class SummaryService:
    def __init__(self):
        pass

    def generate(self, distribution: DistributionResult, outliers: OutlierResult, insights: List[Insight], row_count: int) -> ExecutiveSummary:
        
        # Calculate dataset completeness
        total_cells = len(distribution.columns) * row_count if row_count > 0 else 0
        total_missing = sum([(stats.get("missing_percentage", 0) / 100) * row_count for stats in distribution.columns.values()])
        
        if total_cells > 0:
            completeness = 100 - ((total_missing / total_cells) * 100)
        else:
            completeness = 0.0
            
        # Calculate dataset quality score
        # Base 100, deduct for missing data and outliers
        quality_score = 100.0 - (100 - completeness) * 1.5 - min(30, outliers.outlier_percentage * 2)
        quality_score = max(0, min(100, int(quality_score)))
        
        # Readiness score (for ML)
        # Deduct for Critical insights and low quality
        critical_insights = [i for i in insights if i.severity == "Critical"]
        readiness_score = quality_score - (len(critical_insights) * 15)
        readiness_score = max(0, min(100, int(readiness_score)))
        
        strongest_findings = [i for i in insights if i.severity == "Info" and i.confidence == "High"][:3]
        weakest_areas = [i for i in insights if i.severity in ["Critical", "Warning"]][:3]
        potential_risks = [i for i in insights if i.category in ["Outlier", "Data Quality"] and i.severity in ["Critical", "Warning"]][:3]
        
        summary_text = (
            f"This dataset contains {len(distribution.columns)} columns. "
            f"It has an overall quality score of {quality_score}/100 and a completeness of {completeness:.1f}%. "
        )
        if len(critical_insights) > 0:
            summary_text += f"There are {len(critical_insights)} critical data quality issues that should be addressed before further modeling. "
        else:
            summary_text += "The dataset is generally in good health and ready for further modeling. "
            
        if strongest_findings:
            summary_text += f"Key finding: {strongest_findings[0].description}"
            
        return ExecutiveSummary(
            dataset_quality_score=quality_score,
            readiness_score=readiness_score,
            completeness=float(completeness),
            strongest_findings=strongest_findings,
            weakest_areas=weakest_areas,
            potential_risks=potential_risks,
            executive_summary_text=summary_text
        )
