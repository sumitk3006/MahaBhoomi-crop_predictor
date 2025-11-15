import React, { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line, RadarChart, Radar,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, PolarAngleAxis, PolarRadiusAxis, PolarGrid
} from 'recharts';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './ResultPage.css';

const ResultPage = () => {
  const location = useLocation();
  const dashboardRef = useRef(null);
  const [language, setLanguage] = useState('en');
  const [marketTrendSeries, setMarketTrendSeries] = useState(null);
  const [loadingMarketTrend, setLoadingMarketTrend] = useState(false);
  const [marketOverview, setMarketOverview] = useState(null);
  const [marketRecommendations, setMarketRecommendations] = useState([]);

  const {
    predicted_production = 0,
    yield_per_hectare = 0,
    area = 0,
    rainfall = 0,
    crop = 'N/A',
    district = 'N/A',
    season = 'N/A',
    soil_quality = 'N/A',
    soil_quality_score = 0,
    rainfall_efficiency = 0,
    area_efficiency = 0,
    overall_sustainability_score = 0,
    recommendations = [],
    farmer_guide = {}
  } = location.state || {};

  // Multi-language translations
  const translations = {
    en: {
      farmersGuide: "Farmer's Action Guide",
      actionPoints: "Action Points",
      pros: "Advantages",
      cons: "Challenges",
      whatToDo: "What to Do",
      doNotDo: "What to Avoid",
      detailedRecommendations: "Detailed Recommendations",
      soilManagement: "Soil Management",
      waterManagement: "Water Management",
      cropManagement: "Crop Management",
      marketInfo: "Market Information",
      language: "Select Language",
      english: "English",
      hindi: "Hindi",
      marathi: "Marathi",
      excellent: "Excellent Conditions",
      good: "Good Conditions",
      moderate: "Moderate Conditions",
      poor: "Needs Improvement",
      // Chart titles
      efficiencyMetrics: "Efficiency Metrics",
      productionBreakdown: "Production Breakdown",
      performanceAnalysis: "Performance Analysis",
      resourceUtilization: "Resource Utilization",
      soilQuality: "Soil Quality",
      rainfallEfficiency: "Rainfall Efficiency",
      areaEfficiency: "Area Efficiency",
      overallSustainability: "Overall Sustainability",
      yieldPotential: "Yield Potential",
      rainfall: "Rainfall",
      areaUtilization: "Area Utilization",
      overallScore: "Overall Score",
      areaUsed: "Area Used",
      rainfallReceived: "Rainfall Received",
      productionGenerated: "Production Generated",
      predictions: "Smart Recommendations",
      downloadReport: "Download Report (PDF)",
      newPrediction: "New Prediction",
      home: "Home",
      maharashtraBhoomi: "Maharashtra Bhoomi - Smart Farming Solutions",
      datadriven: "Data-driven insights for sustainable agriculture"
    },
    hi: {
      farmersGuide: "किसान कार्य मार्गदर्शन",
      actionPoints: "कार्य बिंदु",
      pros: "लाभ",
      cons: "चुनौतियाँ",
      whatToDo: "क्या करें",
      doNotDo: "क्या न करें",
      detailedRecommendations: "विस्तृत सिफारिशें",
      soilManagement: "मिट्टी प्रबंधन",
      waterManagement: "जल प्रबंधन",
      cropManagement: "फसल प्रबंधन",
      marketInfo: "बाजार की जानकारी",
      language: "भाषा चुनें",
      english: "English",
      hindi: "हिंदी",
      marathi: "मराठी",
      excellent: "उत्कृष्ट परिस्थितियाँ",
      good: "अच्छी परिस्थितियाँ",
      moderate: "मध्यम परिस्थितियाँ",
      poor: "सुधार की आवश्यकता",
      // Chart titles
      efficiencyMetrics: "दक्षता मेट्रिक्स",
      productionBreakdown: "उत्पादन विभाजन",
      performanceAnalysis: "प्रदर्शन विश्लेषण",
      resourceUtilization: "संसाधन उपयोग",
      soilQuality: "मिट्टी की गुणवत्ता",
      rainfallEfficiency: "वर्षा की दक्षता",
      areaEfficiency: "क्षेत्र की दक्षता",
      overallSustainability: "समग्र स्थिरता",
      yieldPotential: "उपज क्षमता",
      rainfall: "वर्षा",
      areaUtilization: "क्षेत्र उपयोग",
      overallScore: "समग्र स्कोर",
      areaUsed: "उपयोग किया गया क्षेत्र",
      rainfallReceived: "प्राप्त वर्षा",
      productionGenerated: "उत्पादित उत्पादन",
      predictions: "स्मार्ट सिफारिशें",
      downloadReport: "रिपोर्ट डाउनलोड करें (PDF)",
      newPrediction: "नई भविष्यवाणी",
      home: "होम",
      maharashtraBhoomi: "महाराष्ट्र भूमि - स्मार्ट कृषि समाधान",
      datadriven: "टिकाऊ कृषि के लिए डेटा-संचालित अंतर्दृष्टि"
    },
    mr: {
      farmersGuide: "शेतकरी कृती मार्गदर्शन",
      actionPoints: "कृती बिंदू",
      pros: "फायदे",
      cons: "आव्हान",
      whatToDo: "काय करावे",
      doNotDo: "काय टाळावे",
      detailedRecommendations: "तपशीलवार शिफारशी",
      soilManagement: "मिट्टी व्यवस्थापन",
      waterManagement: "जल व्यवस्थापन",
      cropManagement: "पीक व्यवस्थापन",
      marketInfo: "बाजार माहिती",
      language: "भाषा निवडा",
      english: "English",
      hindi: "हिंदी",
      marathi: "मराठी",
      excellent: "उत्तम परिस्थिती",
      good: "चांगली परिस्थिती",
      moderate: "मध्यम परिस्थिती",
      poor: "सुधारणे आवश्यक",
      // Chart titles
      efficiencyMetrics: "कार्यक्षमता मेट्रिक्स",
      productionBreakdown: "उत्पादन विभाजन",
      performanceAnalysis: "कार्यक्षमता विश्लेषण",
      resourceUtilization: "संसाधन वापर",
      soilQuality: "मातीची गुणवत्ता",
      rainfallEfficiency: "पर्जन्य कार्यक्षमता",
      areaEfficiency: "क्षेत्र कार्यक्षमता",
      overallSustainability: "एकूण स्थिरता",
      yieldPotential: "उत्पादन संभाव्यता",
      rainfall: "पर्जन्य",
      areaUtilization: "क्षेत्र वापर",
      overallScore: "एकूण स्कोर",
      areaUsed: "वापरलेले क्षेत्र",
      rainfallReceived: "प्राप्त पर्जन्य",
      productionGenerated: "उत्पन्न उत्पादन",
      predictions: "स्मार्ट शिफारशी",
      downloadReport: "अहवाल डाउनलोड करा (PDF)",
      newPrediction: "नवीन भविष्यवाणी",
      home: "होम",
      maharashtraBhoomi: "महाराष्ट्र भूमि - स्मार्ट शेती समाधान",
      datadriven: "शिवाय कृषीसाठी डेटा-चालित अंतर्दृष्टी"
    }
  };

  const t = translations[language];

  // Fetch market trend series for the selected crop
  useEffect(() => {
    const fetchMarketTrend = async () => {
      if (!crop || crop === 'N/A') return;
      setLoadingMarketTrend(true);
      try {
        const res = await fetch('http://localhost:5000/api/crop-market-trends', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ crop: crop, state: 'Maharashtra' })
        });
        if (!res.ok) {
          setMarketTrendSeries(null);
          setLoadingMarketTrend(false);
          return;
        }
        const data = await res.json();
        // backend returns `trend_series` and `market_data` (overview)
        setMarketTrendSeries(data.trend_series || null);
        setMarketOverview(data.market_data || null);
        setMarketRecommendations(data.recommendations || []);
      } catch (err) {
        console.error('Error fetching market trend:', err);
        setMarketTrendSeries(null);
      } finally {
        setLoadingMarketTrend(false);
      }
    };

    fetchMarketTrend();
  }, [crop]);

  // Data for Pie Chart - Production Breakdown (with language support)
  const productionBreakdown = [
    { name: language === 'en' ? 'Predicted Production' : language === 'hi' ? 'अनुमानित उत्पादन' : 'अनुमानित उत्पादन', value: predicted_production, fill: '#0d6efd' },
    { name: language === 'en' ? 'Other Potential' : language === 'hi' ? 'अन्य संभावनाएं' : 'इतर संभाव्यता', value: Math.max(0, predicted_production * 0.3), fill: '#6c757d' }
  ];

  // Data for Bar Chart - Efficiency Metrics (with language support)
  const efficiencyMetrics = [
    { name: t.soilQuality, value: soil_quality_score, color: '#fd7e14' },
    { name: t.rainfallEfficiency, value: rainfall_efficiency, color: '#20c997' },
    { name: t.areaEfficiency, value: area_efficiency, color: '#0dcaf0' },
    { name: t.overallSustainability, value: overall_sustainability_score, color: '#6f42c1' }
  ];

  // Data for Radar Chart - Performance Analysis (with language support)
  const performanceData = [
    { metric: t.soilQuality, value: soil_quality_score },
    { metric: t.rainfall, value: rainfall_efficiency },
    { metric: t.areaUtilization, value: area_efficiency },
    { metric: t.overallScore, value: overall_sustainability_score },
    { metric: t.yieldPotential, value: Math.min((yield_per_hectare / 20) * 100, 100) }
  ];

  // Data for comparison chart (with language support)
  const resourceUtilization = [
    { resource: t.areaUsed, usage: area },
    { resource: t.rainfallReceived, usage: rainfall / 10 },
    { resource: t.productionGenerated, usage: predicted_production }
  ];

  // Translation dictionary for Farmer's Guide content
  const guideTranslations = {
    hi: {
      // Smart Recommendations (from backend)
      "Rainfall is below optimal. Consider irrigation.": "वर्षा कम है। सिंचाई पर विचार करें।",
      "High rainfall detected. Ensure proper drainage.": "अधिक वर्षा दर्ज की गई। उचित जल निकासी सुनिश्चित करें।",
      "Soil quality is poor. Consider soil amendments.": "मिट्टी की गुणवत्ता खराब है। मिट्टी में सुधार पर विचार करें।",
      "Small farm size. Focus on high-value crops.": "खेत का आकार छोटा है। उच्च मूल्य की फसलों पर ध्यान दें।",
      "Low predicted yield. Review farming practices.": "कम अनुमानित पैदावार। कृषि प्रथाओं की समीक्षा करें।",
      "Farming conditions are optimal!": "कृषि परिस्थितियां इष्टतम हैं!",
      // Soil Management
      "Conduct regular soil testing every 2 years": "हर 2 साल में नियमित मिट्टी परीक्षण करें",
      "Add organic matter (compost/manure) annually": "वार्षिक रूप से जैविक पदार्थ (खाद/गोबर) मिलाएं",
      "Practice crop rotation to maintain fertility": "उर्वरता बनाए रखने के लिए फसल चक्र का अभ्यास करें",
      "Maintain current practices": "वर्तमान प्रथाओं को बनाए रखें",
      "Add phosphate and potassium rich fertilizers": "फॉस्फेट और पोटेशियम समृद्ध खाद डालें",
      "Avoid excessive chemical fertilizer use": "अत्यधिक रासायनिक खाद का उपयोग न करें",
      "Do not ignore soil pH levels": "मिट्टी के pH स्तर को नजरअंदाज न करें",
      "Avoid monoculture farming": "एकल फसल खेती न करें",
      "Do not use contaminated water for irrigation": "सिंचाई के लिए दूषित पानी का उपयोग न करें",
      "Better nutrient absorption": "बेहतर पोषक तत्वों का अवशोषण",
      "Improved microbial activity": "सूक्ष्मजीव गतिविधि में सुधार",
      "Higher water retention": "उच्च जल धारण क्षमता",
      "Reduced fertilizer costs in long term": "दीर्घकालीन में कम खाद लागत",
      "Initial investment in soil amendments": "मिट्टी संशोधन में प्रारंभिक निवेश",
      "Time-consuming soil improvement process": "मिट्टी सुधार की समय लेने वाली प्रक्रिया",
      "Regular monitoring required": "नियमित निगरानी आवश्यक",
      "Weather dependent results": "मौसम पर निर्भर परिणाम",
      // Water Management
      "Install drip irrigation system": "ड्रिप सिंचाई प्रणाली स्थापित करें",
      "Maintain drainage system": "जल निकासी प्रणाली बनाए रखें",
      "Schedule irrigation based on soil moisture": "मिट्टी की नमी के आधार पर सिंचाई शेड्यूल करें",
      "Collect and store rainwater during monsoon": "मानसून के दौरान वर्षा जल संचय करें",
      "Monitor water quality regularly": "नियमित रूप से जल की गुणवत्ता की निगरानी करें",
      "Do not over-irrigate crops": "फसलों को अत्यधिक सिंचित न करें",
      "Avoid watering during peak heat": "तेज गर्मी के दौरान पानी न दें",
      "Do not use stagnant water": "स्थिर पानी का उपयोग न करें",
      "Avoid water wastage": "जल बर्बादी न करें",
      "Water-efficient crop growth": "जल-कुशल फसल वृद्धि",
      "Reduced water costs": "कम जल लागत",
      "Better yield with optimal moisture": "इष्टतम नमी के साथ बेहतर पैदावार",
      "Drought resistance": "सूखा प्रतिरोध",
      "Setup costs for irrigation systems": "सिंचन प्रणाली की स्थापना लागत",
      "Requires technical knowledge": "तकनीकी ज्ञान की आवश्यकता",
      "Maintenance of irrigation infrastructure": "सिंचन बुनियादी ढांचे का रखरखाव",
      "Electricity costs for pumping": "पंपिंग के लिए बिजली लागत",
      "Drainage system investment": "जल निकासी प्रणाली निवेश",
      // Crop Management
      "Plant at optimal season": "इष्टतम मौसम में लगाएं",
      "Use certified seeds for better germination": "बेहतर अंकुरण के लिए प्रमाणित बीज का उपयोग करें",
      "Apply fertilizers at recommended intervals": "अनुशंसित अंतराल पर खाद लागू करें",
      "Monitor for pests and diseases regularly": "नियमित रूप से कीटों और रोगों की निगरानी करें",
      "Harvest at peak maturity for maximum yield": "अधिकतम पैदावार के लिए पूर्ण परिपक्वता पर कटाई करें",
      "Do not plant outside recommended season": "अनुशंसित मौसम से बाहर न लगाएं",
      "Avoid using old or damaged seeds": "पुराने या खराब बीजों का उपयोग न करें",
      "Do not skip disease prevention measures": "रोग निवारण उपायों को छोड़ें नहीं",
      "Avoid harvesting too early or too late": "बहुत जल्दी या बहुत देर से कटाई न करें",
      "Do not ignore weather warnings": "मौसम की चेतावनियों को नजरअंदाज न करें",
      "Better quality harvest": "बेहतर गुणवत्ता की कटाई",
      "Market-ready produce": "बाजार के लिए तैयार उत्पाद",
      "Maximized revenue": "अधिकतम राजस्व",
      "Requires consistent effort and monitoring": "निरंतर प्रयास और निगरानी की आवश्यकता",
      "Weather risks": "मौसम जोखिम",
      "Pest management costs": "कीट प्रबंधन लागत",
      "Labor-intensive at harvest time": "कटाई के समय श्रम-गहन",
      // Market Information
      "Check market rates before harvest": "कटाई से पहले बाजार दरों की जांच करें",
      "Join farmer cooperative for better prices": "बेहतर कीमतों के लिए किसान सहकारिता में शामिल हों",
      "Store produce in proper facilities": "उपयुक्त सुविधाओं में उत्पाद संरक्षित करें",
      "Plan direct selling to reduce middlemen": "बिचौलियों को कम करने के लिए सीधी बिक्री की योजना बनाएं",
      "Do not sell immediately after harvest": "कटाई के तुरंत बाद न बेचें",
      "Avoid selling to unfair traders": "अनुचित व्यापारियों को न बेचें",
      "Do not ignore proper grading": "उचित ग्रेडिंग को नजरअंदाज न करें",
      "Avoid poor storage conditions": "खराब भंडारण स्थितियों से बचें",
      "Better understanding of market dynamics": "बाजार गतिशीलता की बेहतर समझ",
      "Improved income through fair pricing": "उचित मूल्य निर्धारण के माध्यम से बेहतर आय",
      "Quality maintenance": "गुणवत्ता रखरखाव",
      "Reduced post-harvest losses": "कटाई के बाद नुकसान में कमी",
      "Requires market knowledge": "बाजार ज्ञान की आवश्यकता",
      "Storage facility investment": "भंडारण सुविधा निवेश",
      "Transport and logistics costs": "परिवहन और लॉजिस्टिक लागत",
      "Market price volatility": "बाजार मूल्य अस्थिरता"
    },
    mr: {
      // Smart Recommendations (from backend)
      "Rainfall is below optimal. Consider irrigation.": "वर्षा कमी आहे. सिंचनावर विचार करा.",
      "High rainfall detected. Ensure proper drainage.": "उच्च वर्षा दर्ज केली गई. योग्य जल निकालीची खात्री करा.",
      "Soil quality is poor. Consider soil amendments.": "मातीची गुणवत्ता खराब आहे. मातीत सुधारणांवर विचार करा.",
      "Small farm size. Focus on high-value crops.": "शेताचा आकार लहान आहे. उच्च मूल्याच्या पिकांवर लक्ष दिल्या.",
      "Low predicted yield. Review farming practices.": "कमी अनुमानित उत्पादन. कृषी प्रथांचे पुनरावलोकन करा.",
      "Farming conditions are optimal!": "कृषी परिस्थिती इष्टतम आहे!",
      // Soil Management
      "Conduct regular soil testing every 2 years": "दर 2 वर्षांनी नियमित मातीचे परीक्षण करा",
      "Add organic matter (compost/manure) annually": "वार्षिक जैविक पदार्थ (खत/गोवर) मिळवा",
      "Practice crop rotation to maintain fertility": "सुपिकता राखण्यासाठी पीक रोटेशन करा",
      "Maintain current practices": "वर्तमान प्रथा राखा",
      "Add phosphate and potassium rich fertilizers": "फॉस्फेट आणि पोटॅशियम समृद्ध खते घाला",
      "Avoid excessive chemical fertilizer use": "अत्यधिक रासायनिक खतांचा वापर करू नका",
      "Do not ignore soil pH levels": "मातीचे pH पातळी दुर्लक्ष करू नका",
      "Avoid monoculture farming": "एकल पीक शेती करू नका",
      "Do not use contaminated water for irrigation": "सिंचनसाठी दूषित पाणी वापरू नका",
      "Better nutrient absorption": "पोषक तत्वांचे चांगले शोषण",
      "Improved microbial activity": "सूक्ष्मजीव क्रियाकलापात सुधार",
      "Higher water retention": "उच्च जल धारण क्षमता",
      "Reduced fertilizer costs in long term": "दीर्घकालीन खत खर्चात कमी",
      "Initial investment in soil amendments": "मातीत सुधारामध्ये प्रारंभिक गुंतवणूक",
      "Time-consuming soil improvement process": "मातीत सुधारणे वेळ लागणारी प्रक्रिया",
      "Regular monitoring required": "नियमित निरीक्षण आवश्यक",
      "Weather dependent results": "हवामान अवलंबून परिणाम",
      // Water Management
      "Install drip irrigation system": "ड्रिप सिंचन प्रणाली स्थापित करा",
      "Maintain drainage system": "जल निचरा प्रणाली राखा",
      "Schedule irrigation based on soil moisture": "मातीच्या ओलावणीवर आधारित सिंचन वेळापत्रक करा",
      "Collect and store rainwater during monsoon": "मान्सूनमध्ये पर्जन्य जल गोळा करा",
      "Monitor water quality regularly": "नियमित जल गुणवत्ता तपासा",
      "Do not over-irrigate crops": "पिकांना अत्यधिक सिंचन करू नका",
      "Avoid watering during peak heat": "तीव्र उष्णतेमध्ये पाणी देऊ नका",
      "Do not use stagnant water": "स्थिर पाणी वापरू नका",
      "Avoid water wastage": "पाण्याचा अपव्यय करू नका",
      "Water-efficient crop growth": "जल-कुशल पीक वृद्धि",
      "Reduced water costs": "कमी जल खर्च",
      "Better yield with optimal moisture": "इष्टतम ओलावणीने उच्च उत्पादन",
      "Drought resistance": "दुष्काळ प्रतिरोध",
      "Setup costs for irrigation systems": "सिंचन प्रणाली स्थापनेची किंमत",
      "Requires technical knowledge": "तांत्रिक ज्ञान आवश्यक",
      "Maintenance of irrigation infrastructure": "सिंचन पायाभूत देखभाल",
      "Electricity costs for pumping": "पंप करण्याची विजली किंमत",
      "Drainage system investment": "जल निचरा प्रणाली गुंतवणूक",
      // Crop Management
      "Plant at optimal season": "इष्टतम हंगाम (मध्ये लागवड करा",
      "Use certified seeds for better germination": "चांगल्या अंकुरासाठी प्रमाणित बियाणे वापरा",
      "Apply fertilizers at recommended intervals": "शिफारस केलेल्या अंतराने खते घाला",
      "Monitor for pests and diseases regularly": "नियमित कीटपतंग आणि रोग तपासणी करा",
      "Harvest at peak maturity for maximum yield": "जास्तीत जास्त उत्पादनासाठी परिपक्वतेवर कापणी करा",
      "Do not plant outside recommended season": "शिफारस केलेल्या हंगामाबाहेर लागवड करू नका",
      "Avoid using old or damaged seeds": "जुनी किंवा खराब बियाणे वापरू नका",
      "Do not skip disease prevention measures": "रोग प्रतिबंध उपायांकडे दुर्लक्ष करू नका",
      "Avoid harvesting too early or too late": "खूप लवकर किंवा उशिरा कापणी करू नका",
      "Do not ignore weather warnings": "हवामान सावधानीकडे दुर्लक्ष करू नका",
      "Better quality harvest": "चांगल्या गुणवत्तेची कापणी",
      "Market-ready produce": "बाजारासाठी तयार उत्पादन",
      "Maximized revenue": "जास्तीत जास्त उत्पन्न",
      "Requires consistent effort and monitoring": "सतत प्रयत्न आणि निरीक्षण आवश्यक",
      "Weather risks": "हवामान जोखीम",
      "Pest management costs": "कीटप्रबंधन खर्च",
      "Labor-intensive at harvest time": "कापणी वेळी श्रम गहन",
      // Market Information
      "Check market rates before harvest": "कापणीपूर्वी बाजार दर तपासा",
      "Join farmer cooperative for better prices": "चांगल्या किमतीसाठी शेतकरी सहकारी संस्थेत सामील व्हा",
      "Store produce in proper facilities": "योग्य सुविधांमध्ये उत्पाद साठवा",
      "Plan direct selling to reduce middlemen": "मध्यस्थी कमी करण्यासाठी थेट विक्रयाचा योजना करा",
      "Do not sell immediately after harvest": "कापणीनंतर लगेच विक्रय करू नका",
      "Avoid selling to unfair traders": "अनुचित व्यापार्यांना विक्रय करू नका",
      "Do not ignore proper grading": "योग्य गुणवत्ता निर्धारण दुर्लक्ष करू नका",
      "Avoid poor storage conditions": "खराब साठवण परिस्थिती टाळा",
      "Better understanding of market dynamics": "बाजार गतिशीलतेची चांगली समज",
      "Improved income through fair pricing": "न्याय्य किमतीने उच्च उत्पन्न",
      "Quality maintenance": "गुणवत्ता राखरखाव",
      "Reduced post-harvest losses": "कापणीनंतर नुकसान कमी",
      "Requires market knowledge": "बाजार ज्ञान आवश्यक",
      "Storage facility investment": "साठवण सुविधा गुंतवणूक",
      "Transport and logistics costs": "वाहतूक आणि लॉजिस्टिक खर्च",
      "Market price volatility": "बाजार दर अस्थिरता"
    }
  };

  // Function to translate guide content
  const translateGuideContent = (text, lang) => {
    if (lang === 'en') return text;
    return guideTranslations[lang]?.[text] || text;
  };

  // Use crop guide from backend or provide fallback structure
  const farmerGuide = farmer_guide && Object.keys(farmer_guide).length > 0 
    ? farmer_guide 
    : { soil_mgmt: {}, water_mgmt: {}, crop_mgmt: {}, market_info: {} };

  // Generate detailed farmer's guide based on conditions (DEPRECATED - kept for reference)
  const generateFarmerGuide = () => {
    const guide = {
      en: {
        soilMgmt: [
          {
            title: "Soil Quality Assessment",
            whatToDo: [
              "Conduct regular soil testing every 2 years",
              "Add organic matter (compost/manure) annually",
              "Practice crop rotation to maintain fertility",
              soil_quality === "Good" ? "Maintain current practices" : "Add phosphate and potassium rich fertilizers"
            ],
            doNotDo: [
              "Avoid excessive chemical fertilizer use",
              "Do not ignore soil pH levels",
              "Avoid monoculture farming",
              "Do not use contaminated water for irrigation"
            ],
            pros: [
              "Better nutrient absorption",
              "Improved microbial activity",
              "Higher water retention",
              "Reduced fertilizer costs in long term"
            ],
            cons: [
              "Initial investment in soil amendments",
              "Time-consuming soil improvement process",
              "Regular monitoring required",
              "Weather dependent results"
            ]
          }
        ],
        waterMgmt: [
          {
            title: "Water Management Strategy",
            whatToDo: [
              rainfall < 600 ? "Install drip irrigation system" : "Maintain drainage system",
              "Schedule irrigation based on soil moisture",
              "Collect and store rainwater during monsoon",
              "Monitor water quality regularly"
            ],
            doNotDo: [
              "Do not over-irrigate crops",
              "Avoid watering during peak heat",
              "Do not use stagnant water",
              "Avoid water wastage"
            ],
            pros: [
              "Water-efficient crop growth",
              "Reduced water costs",
              "Better yield with optimal moisture",
              "Drought resistance"
            ],
            cons: [
              "Setup costs for irrigation systems",
              "Requires technical knowledge",
              "Maintenance of irrigation infrastructure",
              rainfall < 600 ? "Electricity costs for pumping" : "Drainage system investment"
            ]
          }
        ],
        cropMgmt: [
          {
            title: `${crop} Cultivation Guide`,
            whatToDo: [
              `Plant ${crop} at optimal season (${season})`,
              "Use certified seeds for better germination",
              "Apply fertilizers at recommended intervals",
              "Monitor for pests and diseases regularly",
              "Harvest at peak maturity for maximum yield"
            ],
            doNotDo: [
              "Do not plant outside recommended season",
              "Avoid using old or damaged seeds",
              "Do not skip disease prevention measures",
              "Avoid harvesting too early or too late",
              "Do not ignore weather warnings"
            ],
            pros: [
              `Optimal production of ${predicted_production.toFixed(1)} Quintals`,
              "Better quality harvest",
              "Market-ready produce",
              "Maximized revenue"
            ],
            cons: [
              "Requires consistent effort and monitoring",
              "Weather risks",
              "Pest management costs",
              "Labor-intensive at harvest time"
            ]
          }
        ],
        marketInfo: [
          {
            title: "Market & Economics",
            whatToDo: [
              `Expected production: ${predicted_production.toFixed(2)} Quintals from ${area.toFixed(2)} Ha`,
              "Check market rates before harvest",
              "Join farmer cooperative for better prices",
              "Store produce in proper facilities",
              "Plan direct selling to reduce middlemen"
            ],
            doNotDo: [
              "Do not sell immediately after harvest",
              "Avoid selling to unfair traders",
              "Do not ignore proper grading",
              "Avoid poor storage conditions"
            ],
            pros: [
              "Better understanding of market dynamics",
              "Improved income through fair pricing",
              "Quality maintenance",
              "Reduced post-harvest losses"
            ],
            cons: [
              "Requires market knowledge",
              "Storage facility investment",
              "Transport and logistics costs",
              "Market price volatility"
            ]
          }
        ]
      },
      hi: {
        soilMgmt: [
          {
            title: "मिट्टी गुणवत्ता मूल्यांकन",
            whatToDo: [
              "हर 2 साल में नियमित मिट्टी परीक्षण करें",
              "वार्षिक रूप से जैविक पदार्थ (खाद/गोबर) मिलाएं",
              "उर्वरता बनाए रखने के लिए फसल चक्र का अभ्यास करें",
              soil_quality === "Good" ? "वर्तमान प्रथाओं को बनाए रखें" : "फॉस्फेट और पोटेशियम समृद्ध खाद डालें"
            ],
            doNotDo: [
              "अत्यधिक रासायनिक खाद का उपयोग न करें",
              "मिट्टी के pH स्तर को नजरअंदाज न करें",
              "एकल फसल खेती न करें",
              "सिंचाई के लिए दूषित पानी का उपयोग न करें"
            ],
            pros: [
              "बेहतर पोषक तत्वों का अवशोषण",
              "सूक्ष्मजीव गतिविधि में सुधार",
              "उच्च जल धारण क्षमता",
              "दीर्घकालीन में कम खाद लागत"
            ],
            cons: [
              "मिट्टी संशोधन में प्रारंभिक निवेश",
              "मिट्टी सुधार की समय लेने वाली प्रक्रिया",
              "नियमित निगरानी आवश्यक",
              "मौसम पर निर्भर परिणाम"
            ]
          }
        ],
        waterMgmt: [
          {
            title: "जल प्रबंधन रणनीति",
            whatToDo: [
              rainfall < 600 ? "ड्रिप सिंचाई प्रणाली स्थापित करें" : "जल निकासी प्रणाली बनाए रखें",
              "मिट्टी की नमी के आधार पर सिंचाई शेड्यूल करें",
              "मानसून के दौरान वर्षा जल संचय करें",
              "नियमित रूप से जल की गुणवत्ता की निगरानी करें"
            ],
            doNotDo: [
              "फसलों को अत्यधिक सिंचित न करें",
              "तेज गर्मी के दौरान पानी न दें",
              "स्थिर पानी का उपयोग न करें",
              "जल बर्बादी न करें"
            ],
            pros: [
              "जल-कुशल फसल वृद्धि",
              "कम जल लागत",
              "इष्टतम नमी के साथ बेहतर पैदावार",
              "सूखा प्रतिरोध"
            ],
            cons: [
              "सिंचाई प्रणाली की स्थापना लागत",
              "तकनीकी ज्ञान की आवश्यकता",
              "सिंचाई बुनियादी ढांचे का रखरखाव",
              rainfall < 600 ? "पंपिंग के लिए बिजली लागत" : "जल निकासी प्रणाली निवेश"
            ]
          }
        ],
        cropMgmt: [
          {
            title: `${crop} खेती मार्गदर्शन`,
            whatToDo: [
              `इष्टतम मौसम (${season}) में ${crop} लगाएं`,
              "बेहतर अंकुरण के लिए प्रमाणित बीज का उपयोग करें",
              "अनुशंसित अंतराल पर खाद लागू करें",
              "नियमित रूप से कीटों और रोगों की निगरानी करें",
              "अधिकतम पैदावार के लिए पूर्ण परिपक्वता पर कटाई करें"
            ],
            doNotDo: [
              "अनुशंसित मौसम से बाहर न लगाएं",
              "पुराने या खराब बीजों का उपयोग न करें",
              "रोग निवारण उपायों को छोड़ें नहीं",
              "बहुत जल्दी या बहुत देर से कटाई न करें",
              "मौसम की चेतावनियों को नजरअंदाज न करें"
            ],
            pros: [
              `${crop} का इष्टतम उत्पादन ${predicted_production.toFixed(1)} क्विंटल`,
              "बेहतर गुणवत्ता की कटाई",
              "बाजार के लिए तैयार उत्पाद",
              "अधिकतम राजस्व"
            ],
            cons: [
              "निरंतर प्रयास और निगरानी की आवश्यकता",
              "मौसम जोखिम",
              "कीट प्रबंधन लागत",
              "कटाई के समय श्रम-गहन"
            ]
          }
        ],
        marketInfo: [
          {
            title: "बाजार और अर्थशास्त्र",
            whatToDo: [
              `अपेक्षित उत्पादन: ${area.toFixed(2)} हेक्टेयर से ${predicted_production.toFixed(2)} क्विंटल`,
              "कटाई से पहले बाजार दरों की जांच करें",
              "बेहतर कीमतों के लिए किसान सहकारिता में शामिल हों",
              "उपयुक्त सुविधाओं में उत्पाद संरक्षित करें",
              "बिचौलियों को कम करने के लिए सीधी बिक्री की योजना बनाएं"
            ],
            doNotDo: [
              "कटाई के तुरंत बाद न बेचें",
              "अनुचित व्यापारियों को न बेचें",
              "उचित ग्रेडिंग को नजरअंदाज न करें",
              "खराब भंडारण स्थितियों से बचें"
            ],
            pros: [
              "बाजार गतिशीलता की बेहतर समझ",
              "उचित मूल्य निर्धारण के माध्यम से बेहतर आय",
              "गुणवत्ता रखरखाव",
              "कटाई के बाद नुकसान में कमी"
            ],
            cons: [
              "बाजार ज्ञान की आवश्यकता",
              "भंडारण सुविधा निवेश",
              "परिवहन और लॉजिस्टिक लागत",
              "बाजार मूल्य अस्थिरता"
            ]
          }
        ]
      },
      mr: {
        soilMgmt: [
          {
            title: "मातीची गुणवत्ता मूल्यांकन",
            whatToDo: [
              "दर 2 वर्षांनी नियमित मातीचे परीक्षण करा",
              "वार्षिक जैविक पदार्थ (खत/गोवर) मिळवा",
              "सुपिकता राखण्यासाठी पीक रोटेशन करा",
              soil_quality === "Good" ? "वर्तमान प्रथा राखा" : "फॉस्फेट आणि पोटॅशियम समृद्ध खते घाला"
            ],
            doNotDo: [
              "अत्यधिक रासायनिक खतांचा वापर करू नका",
              "मातीचे pH पातळी दुर्लक्ष करू नका",
              "एकल पीक शेती करू नका",
              "सिंचनसाठी दूषित पाणी वापरू नका"
            ],
            pros: [
              "पोषक तत्वांचे चांगले शोषण",
              "सूक्ष्मजीव क्रियाकलापात सुधार",
              "उच्च जल धारण क्षमता",
              "दीर्घकालीन खत खर्चात कमी"
            ],
            cons: [
              "मातीत सुधारामध्ये प्रारंभिक गुंतवणूक",
              "मातीत सुधारणे वेळ लागणारी प्रक्रिया",
              "नियमित निरीक्षण आवश्यक",
              "हवामान अवलंबून परिणाम"
            ]
          }
        ],
        waterMgmt: [
          {
            title: "जल व्यवस्थापन रणनीति",
            whatToDo: [
              rainfall < 600 ? "ड्रिप सिंचन प्रणाली स्थापित करा" : "जल निचरा प्रणाली राखा",
              "मातीच्या ओलावणीवर आधारित सिंचन वेळापत्रक करा",
              "मान्सूनमध्ये पर्जन्य जल गोळा करा",
              "नियमित जल गुणवत्ता तपासा"
            ],
            doNotDo: [
              "पिकांना अत्यधिक सिंचन करू नका",
              "तीव्र उष्णतेमध्ये पाणी देऊ नका",
              "स्थिर पाणी वापरू नका",
              "पाण्याचा अपव्यय करू नका"
            ],
            pros: [
              "जल-कुशल पीक वृद्धि",
              "कमी जल खर्च",
              "इष्टतम ओलावणीने उच्च उत्पादन",
              "दुष्काळ प्रतिरोध"
            ],
            cons: [
              "सिंचन प्रणाली स्थापनेची किंमत",
              "तांत्रिक ज्ञान आवश्यक",
              "सिंचन पायाभूत देखभाल",
              rainfall < 600 ? "पंप करण्याची विजली किंमत" : "जल निचरा प्रणाली गुंतवणूक"
            ]
          }
        ],
        cropMgmt: [
          {
            title: `${crop} लागवड मार्गदर्शन`,
            whatToDo: [
              `इष्टतम हंगाम (${season})मध्ये ${crop} लागवड करा`,
              "चांगल्या अंकुरासाठी प्रमाणित बियाणे वापरा",
              "शिफारस केलेल्या अंतराने खते घाला",
              "नियमित कीटपतंग आणि रोग तपासणी करा",
              "जास्तीत जास्त उत्पादनासाठी परिपक्वतेवर कापणी करा"
            ],
            doNotDo: [
              "शिफारस केलेल्या हंगामाबाहेर लागवड करू नका",
              "जुनी किंवा खराब बियाणे वापरू नका",
              "रोग प्रतिबंध उपायांकडे दुर्लक्ष करू नका",
              "खूप लवकर किंवा उशिरा कापणी करू नका",
              "हवामान सावधानीकडे दुर्लक्ष करू नका"
            ],
            pros: [
              `${crop}चे इष्टतम उत्पादन ${predicted_production.toFixed(1)} क्विंटल`,
              "चांगल्या गुणवत्तेची कापणी",
              "बाजारासाठी तयार उत्पादन",
              "जास्तीत जास्त उत्पन्न"
            ],
            cons: [
              "सतत प्रयत्न आणि निरीक्षण आवश्यक",
              "हवामान जोखीम",
              "कीटप्रबंधन खर्च",
              "कापणी वेळी श्रम गहन"
            ]
          }
        ],
        marketInfo: [
          {
            title: "बाजार आणि अर्थशास्त्र",
            whatToDo: [
              `अपेक्षित उत्पादन: ${area.toFixed(2)} हेक्टरपासून ${predicted_production.toFixed(2)} क्विंटल`,
              "कापणीपूर्वी बाजार दर तपासा",
              "चांगल्या किमतीसाठी शेतकरी सहकारी संस्थेत सामील व्हा",
              "योग्य सुविधांमध्ये उत्पाद साठवा",
              "मध्यस्थी कमी करण्यासाठी थेट विक्रयाचा योजना करा"
            ],
            doNotDo: [
              "कापणीनंतर लगेच विक्रय करू नका",
              "अनुचित व्यापार्यांना विक्रय करू नका",
              "योग्य गुणवत्ता निर्धारण दुर्लक्ष करू नका",
              "खराब साठवण परिस्थिती टाळा"
            ],
            pros: [
              "बाजार गतिशीलतेची चांगली समज",
              "न्याय्य किमतीने उच्च उत्पन्न",
              "गुणवत्ता राखरखाव",
              "कापणीनंतर नुकसान कमी"
            ],
            cons: [
              "बाजार ज्ञान आवश्यक",
              "साठवण सुविधा गुंतवणूक",
              "वाहतूक आणि लॉजिस्टिक खर्च",
              "बाजार दर अस्थिरता"
            ]
          }
        ]
      }
    };

    return guide[language] || guide.en;
  };

  const downloadPDF = async () => {
    const input = dashboardRef.current;
    try {
      const canvas = await html2canvas(input, { scale: 2, useCORS: true });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, width, height);
      pdf.save(`crop_analysis_${crop}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (!location.state) {
    return (
      <div className="container text-center mt-5">
        <h1>⚠️ No Results Found</h1>
        <p>Please go back and run a prediction first.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container py-5">
      <motion.div
        ref={dashboardRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container-fluid px-4"
      >
        {/* Language Selector */}
        <motion.div
          className="language-selector mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
        >
          <div className="selector-container">
            <label className="selector-label">🌐 {t.language}</label>
            <div className="button-group">
              {[
                { code: 'en', label: t.english },
                { code: 'hi', label: t.hindi },
                { code: 'mr', label: t.marathi }
              ].map((lang) => (
                <button
                  key={lang.code}
                  className={`lang-btn ${language === lang.code ? 'active' : ''}`}
                  onClick={() => setLanguage(lang.code)}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* KPI Cards Section */}
        <div className="row mb-4 g-3">
          <motion.div
            className="col-lg-3 col-md-6"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="kpi-card kpi-production">
              <div className="kpi-icon">📊</div>
              <div className="kpi-content">
                <h5>{language === 'en' ? 'Predicted Production' : language === 'hi' ? 'अनुमानित उत्पादन' : 'अनुमानित उत्पादन'}</h5>
                <p className="kpi-value">{predicted_production.toFixed(2)}</p>
                <span className="kpi-unit">{language === 'en' ? 'Quintals' : language === 'hi' ? 'क्विंटल' : 'क्विंटल'}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="col-lg-3 col-md-6"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="kpi-card kpi-yield">
              <div className="kpi-icon">📈</div>
              <div className="kpi-content">
                <h5>{language === 'en' ? 'Yield per Hectare' : language === 'hi' ? 'प्रति हेक्टेयर उपज' : 'प्रति हेक्टर उत्पादन'}</h5>
                <p className="kpi-value">{yield_per_hectare.toFixed(2)}</p>
                <span className="kpi-unit">{language === 'en' ? 'Qtls/Ha' : language === 'hi' ? 'क्विंटल/हे' : 'क्विंटल/हे'}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="col-lg-3 col-md-6"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="kpi-card kpi-sustainability">
              <div className="kpi-icon">🌱</div>
              <div className="kpi-content">
                <h5>{language === 'en' ? 'Sustainability Score' : language === 'hi' ? 'स्थिरता स्कोर' : 'स्थिरता स्कोर'}</h5>
                <p className="kpi-value">{overall_sustainability_score.toFixed(1)}</p>
                <span className="kpi-unit">{language === 'en' ? 'out of 100' : language === 'hi' ? '100 में से' : '100 पैकी'}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="col-lg-3 col-md-6"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="kpi-card kpi-area">
              <div className="kpi-icon">🗺️</div>
              <div className="kpi-content">
                <h5>{language === 'en' ? 'Farming Area' : language === 'hi' ? 'खेती का क्षेत्र' : 'शेतीचे क्षेत्र'}</h5>
                <p className="kpi-value">{area.toFixed(2)}</p>
                <span className="kpi-unit">{language === 'en' ? 'Hectares' : language === 'hi' ? 'हेक्टेयर' : 'हेक्टर'}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Market Trend Chart */}
        <motion.div className="row mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="col-12">
            <div className="card shadow-sm rounded-3 p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="mb-0">{t.marketInfo}</h5>
                <small className="text-muted">{crop} • {district}</small>
              </div>
              {loadingMarketTrend && <div className="text-center py-3 text-muted">Loading market trend...</div>}
              {!loadingMarketTrend && marketOverview && (
                <div className="mb-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <small className="text-muted">Current Market Value</small>
                      <div className="h4 mb-0">₹{marketOverview.average_price.toLocaleString()}</div>
                      <small className="text-muted">{marketOverview.price_unit} • Avg</small>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <small className="text-muted d-block">Trend</small>
                      <div className={`badge ${marketOverview.price_change_percent > 0 ? 'bg-success' : 'bg-danger'} py-2 px-3`}>
                        {marketOverview.trend} • {marketOverview.price_change_percent > 0 ? '+' : ''}{marketOverview.price_change_percent}%
                      </div>
                    </div>
                  </div>

                  {/* Recommendation / Suggestion */}
                  <div className="mt-3 p-3 rounded-2" style={{ backgroundColor: '#f8f9fa' }}>
                    <strong>Suggestion:</strong>
                    <div className="mt-1 text-sm text-muted">
                      {marketRecommendations && marketRecommendations.length > 0 ? (
                        marketRecommendations[0]
                      ) : (
                        marketOverview.price_change_percent > 3 ? 'Prices are rising — consider selling or locking in contracts.' :
                        marketOverview.price_change_percent < -3 ? 'Prices are falling — consider storing produce or waiting for better prices.' :
                        'Prices are relatively stable — consult local mandi for best action.'
                      )}
                    </div>
                  </div>
                </div>
              )}
              {!loadingMarketTrend && marketTrendSeries && (
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={marketTrendSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v) => `₹${v}`} />
                      <Tooltip formatter={(value) => `₹${value}`} />
                      <Line type="monotone" dataKey="price" stroke="#0d6efd" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              {!loadingMarketTrend && !marketTrendSeries && (
                <div className="text-center py-3 text-muted">Market trend not available</div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Farm Details Section */}
        <motion.div
          className="row mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="col-12">
            <div className="details-card">
              <h4 className="card-title">📋 {language === 'en' ? 'Farm & Crop Details' : language === 'hi' ? 'खेत और फसल विवरण' : 'शेत आणि पीक तपशील'}</h4>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">{language === 'en' ? 'Crop Type:' : language === 'hi' ? 'फसल का प्रकार:' : 'पीक प्रकार:'}</span>
                  <span className="detail-value">{crop}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{language === 'en' ? 'District:' : language === 'hi' ? 'जिला:' : 'जिल्हा:'}</span>
                  <span className="detail-value">{district}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{language === 'en' ? 'Season:' : language === 'hi' ? 'मौसम:' : 'हंगाम:'}</span>
                  <span className="detail-value">{season}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{language === 'en' ? 'Soil Quality:' : language === 'hi' ? 'मिट्टी की गुणवत्ता:' : 'मातीची गुणवत्ता:'}</span>
                  <span className="detail-value">{soil_quality}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{language === 'en' ? 'Rainfall:' : language === 'hi' ? 'वर्षा:' : 'पर्जन्य:'}</span>
                  <span className="detail-value">{rainfall.toFixed(2)} mm</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{language === 'en' ? 'Farming Area:' : language === 'hi' ? 'खेती का क्षेत्र:' : 'शेतीचे क्षेत्र:'}</span>
                  <span className="detail-value">{area.toFixed(2)} Ha</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <div className="row mb-4 g-3">
          {/* Efficiency Metrics Bar Chart */}
          <motion.div
            className="col-lg-6"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="chart-card">
              <h4 className="chart-title">📊 {t.efficiencyMetrics}</h4>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={efficiencyMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                  <Bar dataKey="value" fill="#6f42c1" radius={[8, 8, 0, 0]}>
                    {efficiencyMetrics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Production Pie Chart */}
          <motion.div
            className="col-lg-6"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="chart-card">
              <h4 className="chart-title">🥧 {t.productionBreakdown}</h4>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={productionBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {productionBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toFixed(2)} Qtls`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Radar Chart and Resource Utilization */}
        <div className="row mb-4 g-3">
          {/* Performance Radar Chart */}
          <motion.div
            className="col-lg-6"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="chart-card">
              <h4 className="chart-title">🎯 {t.performanceAnalysis}</h4>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={performanceData}>
                  <PolarGrid strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="#0d6efd"
                    fill="#0d6efd"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Resource Utilization Chart */}
          <motion.div
            className="col-lg-6"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="chart-card">
              <h4 className="chart-title">💧 {t.resourceUtilization}</h4>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={resourceUtilization} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="resource" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="usage" fill="#20c997" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Recommendations Section */}
        <motion.div
          className="row mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="col-12">
            <div className="recommendations-card">
              <h4 className="card-title">💡 {t.predictions}</h4>
              <div className="recommendations-list">
                {recommendations.map((recommendation, index) => (
                  <motion.div
                    key={index}
                    className="recommendation-item"
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                  >
                    <div className="recommendation-icon">✓</div>
                    <div className="recommendation-text">{translateGuideContent(recommendation, language)}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Detailed Farmer's Guide Section */}
        <motion.div
          className="row mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <div className="col-12">
            <div className="farmers-guide-card">
              <h3 className="guide-title">📚 {t.farmersGuide}</h3>
              
              {farmerGuide && Object.entries(farmerGuide).length > 0 ? (
                Object.entries(farmerGuide).map((section, idx) => {
                  const [sectionKey, sectionData] = section;
                  const sectionEmojis = {
                    soil_mgmt: "🌱",
                    water_mgmt: "💧",
                    crop_mgmt: "🌾",
                    market_info: "💰"
                  };
                  const sectionTitles = {
                    soil_mgmt: "Soil Management",
                    water_mgmt: "Water Management",
                    crop_mgmt: "Crop Management",
                    market_info: "Market Information"
                  };
                  
                  return (
                    <motion.div
                      key={idx}
                      className="guide-section"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 1 + idx * 0.15 }}
                    >
                      <h4 className="section-title">
                        {sectionEmojis[sectionKey]} {sectionTitles[sectionKey]}
                      </h4>
                      
                      <div className="guide-grid">
                        {/* What To Do */}
                        <div className="guide-column">
                          <h5 className="column-title do-title">✅ {t.whatToDo}</h5>
                          <ul className="action-list">
                            {Array.isArray(sectionData.whatToDo) && sectionData.whatToDo.map((item, i) => (
                              <li key={i} className="action-item">
                                <span className="action-check">→</span>
                                {translateGuideContent(item, language)}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* What Not To Do */}
                        <div className="guide-column">
                          <h5 className="column-title dont-title">❌ {t.doNotDo}</h5>
                          <ul className="action-list">
                            {Array.isArray(sectionData.doNotDo) && sectionData.doNotDo.map((item, i) => (
                              <li key={i} className="action-item avoid">
                                <span className="action-check">✗</span>
                                {translateGuideContent(item, language)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pros-cons-grid">
                        {/* Pros */}
                        <div className="pros-column">
                          <h5 className="pros-title">👍 {t.pros}</h5>
                          <ul className="pros-list">
                            {Array.isArray(sectionData.pros) && sectionData.pros.map((item, i) => (
                              <li key={i} className="pros-item">
                                <span className="pros-icon">✓</span>
                                {translateGuideContent(item, language)}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Cons */}
                        <div className="cons-column">
                          <h5 className="cons-title">⚠️ {t.cons}</h5>
                          <ul className="cons-list">
                            {Array.isArray(sectionData.cons) && sectionData.cons.map((item, i) => (
                              <li key={i} className="cons-item">
                                <span className="cons-icon">!</span>
                                {translateGuideContent(item, language)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="alert alert-info">
                  Loading farmer's guide information...
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="row mb-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="col-12 d-flex gap-3 justify-content-center">
            <button className="btn btn-primary btn-lg shadow-sm" onClick={downloadPDF}>
              📥 {t.downloadReport}
            </button>
            <a href="/predict" className="btn btn-secondary btn-lg shadow-sm">
              🔄 {t.newPrediction}
            </a>
            <a href="/" className="btn btn-outline-secondary btn-lg shadow-sm">
              🏠 {t.home}
            </a>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.div
        className="footer-section text-center mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        <p className="footer-text">
          🌍 {t.maharashtraBhoomi}
        </p>
        <p className="footer-subtext">
          {t.datadriven}
        </p>
      </motion.div>
    </div>
  );
};

export default ResultPage;
