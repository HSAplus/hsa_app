"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calculator } from "lucide-react";
import { CalculatorInputsPanel } from "./calculator-inputs";
import { SavingsChart } from "./savings-chart";
import { ProjectionSummary } from "./projection-summary";
import { ComparisonBars } from "./comparison-bars";
import { useSavingsProjection } from "./use-savings-projection";
import { DEFAULT_CALCULATOR_INPUTS } from "@/lib/hsa-constants";

export function SavingsCalculator() {
  const [inputs, setInputs] = useState(DEFAULT_CALCULATOR_INPUTS);
  const [activeTab, setActiveTab] = useState("projections");
  const { projectionData, summary } = useSavingsProjection(inputs);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">
                HSA Savings Projections
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
              >
                Calculator
              </Badge>
            </div>
            <CardDescription className="mt-1">
              See how your HSA can grow tax-free over time
            </CardDescription>
          </div>
          <div className="rounded-lg p-2 bg-emerald-100 dark:bg-emerald-900/30">
            <Calculator className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="projections">
                Growth Projections
              </TabsTrigger>
              <TabsTrigger value="comparison">HSA vs Taxable</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              {activeTab === "projections" && (
                <TabsContent value="projections" forceMount>
                  <motion.div
                    key="projections"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="grid gap-6 lg:grid-cols-[1fr_320px] mt-4">
                      <SavingsChart data={projectionData} />
                      <div className="space-y-6">
                        <CalculatorInputsPanel
                          inputs={inputs}
                          onChange={setInputs}
                        />
                        <ProjectionSummary summary={summary} />
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>
              )}

              {activeTab === "comparison" && (
                <TabsContent value="comparison" forceMount>
                  <motion.div
                    key="comparison"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mt-4">
                      <ComparisonBars
                        projectionData={projectionData}
                        summary={summary}
                        inputs={inputs}
                      />
                    </div>
                  </motion.div>
                </TabsContent>
              )}
            </AnimatePresence>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
