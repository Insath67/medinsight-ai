"use client";

import AnalysisDetailsHeader from "@/components/analysis-details/AnalysisDetailsHeader";
import AiSummaryCard from "@/components/analysis-details/AiSummaryCard";
import KeyFindingsCard from "@/components/analysis-details/KeyFindingsCard";
import LabResultsCard from "@/components/analysis-details/LabResultsCard";
import ValueExplanationsCard from "@/components/analysis-details/ValueExplanationsCard";
import DoctorQuestionsCard from "@/components/analysis-details/DoctorQuestionsCard";
import RiskIndicatorCard from "@/components/analysis-details/RiskIndicatorCard";
import ReportInfoCard from "@/components/analysis-details/ReportInfoCard";
import AnalysisActionsCard from "@/components/analysis-details/AnalysisActionsCard";
import AbnormalAlertsCard from "@/components/analysis-details/AbnormalAlertsCard";
import NextStepsCard from "@/components/analysis-details/NextStepsCard";
import AppFooter from "@/components/layout/AppFooter";
import React, { useState } from "react";

export default function AnalysisDetailsPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        <AnalysisDetailsHeader />

        <div className="mt-8 grid items-start gap-6 xl:grid-cols-3">
            <div className="space-y-6 xl:col-span-2">
               <AiSummaryCard />
               <KeyFindingsCard />
               <LabResultsCard />
               <ValueExplanationsCard />
               <DoctorQuestionsCard />
        </div>

        <div className="space-y-6 xl:sticky xl:top-8">
               <RiskIndicatorCard />
               <ReportInfoCard />
               <AnalysisActionsCard />
               <AbnormalAlertsCard />
               <NextStepsCard />
        </div>
       </div>
      </div>
      <AppFooter />
    </div>
  );
}