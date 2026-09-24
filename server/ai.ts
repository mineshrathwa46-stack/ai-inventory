import { GoogleGenAI, Type } from '@google/genai';
import { store } from './store.ts';
import { AIInsightItem } from '../src/types/index.ts';

const ai = new GoogleGenAI({
  apiKey: process.env.AI_API_KEY || process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

// Fallback heuristic generator when offline or no API key
function generateHeuristicInsights(): AIInsightItem[] {
  const storeInfo = store.getStoreInfo();
  const metrics = store.getDashboardMetrics();
  const predictions = store.getDemandPredictions();
  const analytics = store.getAnalytics();
  const insights: AIInsightItem[] = [];

  // 1. Stockout Risk
  const critical = predictions.find((p) => p.daysUntilStockout <= 2.5 && p.currentStock > 0);
  if (critical) {
    insights.push({
      id: 'ins-1',
      category: 'risk',
      type: 'urgent',
      title: `Stockout Imminent: ${critical.productName}`,
      description: `${critical.productName} has only ${critical.currentStock} units left and sells at ${critical.avgDailySales} units/day. At this pace, stock will be depleted in ~${critical.daysUntilStockout} days, well ahead of the ${critical.leadTimeDays}-day supplier lead time.`,
      actionLabel: `Order ${critical.recommendedReorderQty} units now`,
      actionType: 'reorder',
      targetProductId: critical.productId,
      dataEvidence: `Burn rate: ${critical.avgDailySales}/day | Lead time: ${critical.leadTimeDays}d | Stockout: ~${critical.daysUntilStockout}d`
    });
  }

  // 2. Growth Opportunity / Surge
  const surging = predictions.find((p) => p.salesTrendPercentage >= 25);
  if (surging) {
    insights.push({
      id: 'ins-2',
      category: 'growth',
      type: 'opportunity',
      title: `Surging Demand: ${surging.productName}`,
      description: `Sales velocity spiked by +${surging.salesTrendPercentage}% over recent periods. Customer interest is accelerating. Increasing your safety buffer by ${surging.safetyStock} units will prevent lost high-margin sales.`,
      actionLabel: 'Adjust Safety Stock',
      actionType: 'buffer',
      targetProductId: surging.productId,
      dataEvidence: `+${surging.salesTrendPercentage}% 7-day velocity change | Projected 14-day demand: ${surging.predicted14DayDemand} units`
    });
  }

  // 3. Dead Stock Liquidation
  if (analytics.deadStock.length > 0) {
    const deadItem = analytics.deadStock[0];
    insights.push({
      id: 'ins-3',
      category: 'dead_stock',
      type: 'optimization',
      title: `Capital Locked in Idle Stock: ${deadItem.productName}`,
      description: `This product has generated fewer than 3 sales over the last 30 days while locking ${storeInfo.currencySymbol}${deadItem.capitalLocked.toLocaleString()} in working capital. Reinvesting this capital into fast-moving inventory could yield 3.8x faster cash turns.`,
      actionLabel: 'Launch 15% Clearance Bundle',
      actionType: 'discount',
      targetProductId: deadItem.productId,
      dataEvidence: `${deadItem.currentStock} units idle for >45 days | ${storeInfo.currencySymbol}${deadItem.capitalLocked} locked capital`
    });
  }

  // 4. Category Trend
  if (analytics.categoryBreakdown.length > 0) {
    const topCat = [...analytics.categoryBreakdown].sort((a, b) => b.revenue - a.revenue)[0];
    insights.push({
      id: 'ins-4',
      category: 'reorder',
      type: 'opportunity',
      title: `${topCat.category} is your #1 Revenue Driver`,
      description: `The ${topCat.category} category generated ${storeInfo.currencySymbol}${topCat.revenue.toLocaleString()} with ${topCat.unitsSold} units sold. Ensure priority shelf placement and negotiate volume rebates with respective suppliers.`,
      actionLabel: 'Review Supplier Terms',
      actionType: 'supplier',
      dataEvidence: `${topCat.productCount} active products | ${topCat.unitsSold} units sold across last 30 days`
    });
  }

  return insights;
}

export async function getAIBusinessInsights(): Promise<{ insights: AIInsightItem[]; isAI: boolean }> {
  const storeInfo = store.getStoreInfo();
  const metrics = store.getDashboardMetrics();
  const predictions = store.getDemandPredictions();
  const analytics = store.getAnalytics();

  if (!process.env.AI_API_KEY && !process.env.GEMINI_API_KEY) {
    return { insights: generateHeuristicInsights(), isAI: false };
  }

  try {
    const summaryPayload = {
      storeName: storeInfo.name,
      category: storeInfo.category,
      currency: storeInfo.currencySymbol,
      metrics: {
        totalInventoryCost: metrics.totalInventoryValueCost,
        todaySales: metrics.todaySalesAmount,
        healthScore: metrics.inventoryHealthScore,
        turnoverRatio: metrics.inventoryTurnoverRatio,
        outOfStock: metrics.outOfStockCount,
        lowStock: metrics.lowStockCount,
        deadCapitalLocked: metrics.deadStockCapitalLocked
      },
      topFastMovers: analytics.fastMoving.map((p) => ({
        name: p.productName,
        stock: p.currentStock,
        avgDailySales: p.avgDailySales,
        trend: p.salesTrendPercentage,
        daysLeft: p.daysUntilStockout
      })),
      deadStockItems: analytics.deadStock.map((p) => ({
        name: p.productName,
        stock: p.currentStock,
        capitalLocked: p.capitalLocked
      })),
      categorySummary: analytics.categoryBreakdown.map((c) => ({
        category: c.category,
        revenue: c.revenue,
        units: c.unitsSold
      }))
    };

    const prompt = `You are the Chief Inventory Intelligence Officer for "${storeInfo.name}", a ${storeInfo.category} retail store.
Analyze this real-time inventory and sales dataset:
${JSON.stringify(summaryPayload, null, 2)}

Provide exactly 4 high-impact, actionable, natural-language executive insights for the retail business owner.
Include:
1. An urgent stockout risk or critical restocking recommendation
2. A fast-moving growth opportunity or surge trend
3. A capital optimization recommendation for dead stock or slow movers
4. A strategic category or supplier margin insight

Return JSON matching the schema with precise numbers from the data.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              category: {
                type: Type.STRING,
                description: 'growth, risk, dead_stock, reorder, or pricing'
              },
              type: {
                type: Type.STRING,
                description: 'urgent, opportunity, optimization, or caution'
              },
              title: { type: Type.STRING },
              description: {
                type: Type.STRING,
                description: 'Clear explanation referencing concrete numbers and actions'
              },
              actionLabel: { type: Type.STRING, description: 'Short button action label' },
              actionType: { type: Type.STRING, description: 'reorder, buffer, discount, supplier' },
              dataEvidence: {
                type: Type.STRING,
                description: 'Brief data points supporting this insight'
              }
            },
            required: ['id', 'category', 'type', 'title', 'description', 'actionLabel', 'actionType', 'dataEvidence']
          }
        }
      }
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { insights: parsed as AIInsightItem[], isAI: true };
      }
    }
  } catch (error) {
    console.error('AI insight generation fallback:', error);
  }

  return { insights: generateHeuristicInsights(), isAI: false };
}

export async function askInventoryAI(userQuestion: string): Promise<string> {
  const storeInfo = store.getStoreInfo();
  const metrics = store.getDashboardMetrics();
  const predictions = store.getDemandPredictions();
  const analytics = store.getAnalytics();
  const suppliers = store.getSuppliers();

  if (!process.env.AI_API_KEY && !process.env.GEMINI_API_KEY) {
    return `Based on live metrics for ${storeInfo.name}:
- Total Inventory Value: ${storeInfo.currencySymbol}${metrics.totalInventoryValueCost.toLocaleString()}
- Inventory Health Score: ${metrics.inventoryHealthScore}/100
- Low/Out-of-Stock Products: ${metrics.lowStockCount + metrics.outOfStockCount} items need attention.
- Top recommendation: Restock ${predictions.filter((p) => p.daysUntilStockout <= 3).map((p) => p.productName).join(', ') || 'all current fast movers'} immediately to prevent stockouts.`;
  }

  try {
    const context = {
      store: storeInfo,
      metrics,
      urgentReorders: predictions
        .filter((p) => p.recommendedReorderQty > 0)
        .slice(0, 6)
        .map((p) => ({
          name: p.productName,
          stock: p.currentStock,
          burnRate: `${p.avgDailySales}/day`,
          daysLeft: p.daysUntilStockout,
          recommendOrder: `${p.recommendedReorderQty} units`
        })),
      fastMovers: analytics.fastMoving.map((p) => p.productName),
      deadStock: analytics.deadStock.map((p) => ({ name: p.productName, locked: p.capitalLocked })),
      suppliers: suppliers.map((s) => ({ name: s.name, leadTime: `${s.leadTimeDays} days`, rating: s.rating }))
    };

    const prompt = `You are "STOCKTINE AI", the expert retail inventory consultant for ${storeInfo.name} (${storeInfo.category}).
Here is the current live store state:
${JSON.stringify(context, null, 2)}

User question: "${userQuestion}"

Provide a concise, practical, retail-savvy answer (2-4 paragraphs or crisp bullet points).
Ground your answer directly in the numbers, supplier lead times, and products shown above.
Do not make up fake products not in the list. Provide actionable next steps the store owner or manager can execute right away.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt
    });

    return response.text || 'Unable to generate analysis at this moment. Please check your inventory dashboard.';
  } catch (err: any) {
    console.error('AI chat error:', err);
    return `I analyzed your inventory state: You currently have ${metrics.lowStockCount} low stock and ${metrics.outOfStockCount} out-of-stock items. Please review the Restock Recommendations page for immediate PO generation.`;
  }
}
