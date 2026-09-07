const geminiService = require('../services/geminiService');
const marketplaceIntelligenceService = require('../services/marketplaceIntelligenceService');

async function askAi(req, res) {
  try {
    const { question, product, quantity, location } = req.body;

    if (!question || !String(question).trim()) {
      return res.status(400).json({ message: 'Question is required' });
    }

    const trimmedQuestion = String(question).trim();
    const context = await marketplaceIntelligenceService.buildAiContext(
      trimmedQuestion,
      req.user || null
    );

    if (product || quantity || location) {
      context.sellRecommendation = await marketplaceIntelligenceService.getSellRecommendation({
        product: product || 'Tomato',
        quantity: quantity || 500,
        location: location || req.user?.location || 'Kundapura',
      });
    }

    if (
      context.dataAvailability.startsWith('Insufficient') &&
      !context.productAnalytics.length
    ) {
      return res.status(200).json({
        answer:
          "I don't have enough data in the platform to answer that reliably. Please add market records or marketplace listings first.",
        contextSummary: {
          marketRecords: 0,
          listings: 0,
          products: 0,
        },
        calculations: {
          sellRecommendation: context.sellRecommendation || null,
          stockRecommendations: context.stockRecommendations || null,
        },
      });
    }

    let answer;
    try {
      answer = await geminiService.generateResponse(trimmedQuestion, context);
    } catch (error) {
      if (error.code === 'GEMINI_NOT_CONFIGURED') {
        return res.status(503).json({
          message:
            'AI is unavailable because GEMINI_API_KEY is not configured. Market and marketplace features still work.',
          calculations: {
            sellRecommendation: context.sellRecommendation || null,
            stockRecommendations: context.stockRecommendations || null,
          },
        });
      }

      return res.status(503).json({
        message:
          'AI is temporarily unavailable. You can still use market data and marketplace features.',
        details: error.message,
        calculations: {
          sellRecommendation: context.sellRecommendation || null,
          stockRecommendations: context.stockRecommendations || null,
        },
      });
    }

    res.status(200).json({
      answer,
      contextSummary: {
        marketRecords: context.relevantMarketRecords.length,
        listings: context.activeMarketplaceListings.length,
        products: context.productAnalytics.length,
      },
      calculations: {
        sellRecommendation: context.sellRecommendation || null,
        stockRecommendations: context.stockRecommendations || null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to process AI request' });
  }
}

async function getSellAdvice(req, res) {
  try {
    const { product, quantity, location } = req.body;

    if (!product) {
      return res.status(400).json({ message: 'Product is required' });
    }

    const recommendation = await marketplaceIntelligenceService.getSellRecommendation({
      product,
      quantity: quantity || 0,
      location: location || req.user?.location,
    });

    let explanation = null;
    if (geminiService.isConfigured()) {
      try {
        explanation = await geminiService.generateResponse(
          `Explain this selling recommendation for ${product} in simple practical language.`,
          { sellRecommendation: recommendation }
        );
      } catch (error) {
        explanation = null;
      }
    }

    res.status(200).json({
      recommendation,
      explanation,
      disclaimer:
        'This is an informational recommendation based on recorded platform data, not a guaranteed selling price.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to generate selling advice' });
  }
}

async function getStockAdvice(req, res) {
  try {
    const recommendations = await marketplaceIntelligenceService.getStockRecommendations();

    let explanation = null;
    if (geminiService.isConfigured()) {
      try {
        explanation = await geminiService.generateResponse(
          'Summarize what a vendor or buyer should consider stocking based on this platform data.',
          { stockRecommendations: recommendations }
        );
      } catch (error) {
        explanation = null;
      }
    }

    res.status(200).json({
      recommendations,
      explanation,
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to generate stock advice' });
  }
}

module.exports = {
  askAi,
  getSellAdvice,
  getStockAdvice,
};
