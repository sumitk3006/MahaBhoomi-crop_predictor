from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS
import pandas as pd
import pickle
import requests
from datetime import datetime, timedelta
import json
import random

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Load the trained model and encoders
model = joblib.load("model/xgboost_crop_yield_model.pkl")
encoder_district = joblib.load("model/ordinal_encoder_district.pkl")
encoder_season = joblib.load("model/ordinal_encoder_season.pkl")
encoder_soil = joblib.load("model/ordinal_encoder_soil.pkl")
scaler = joblib.load("model/scaler.pkl")

try:
    model_rec = pickle.load(open('model/modelrandclf.pkl', 'rb'))
    sc_rec = pickle.load(open('model/standscaler.pkl', 'rb'))
    mx_rec = pickle.load(open('model/minmaxscaler.pkl', 'rb'))
except Exception as e:
    print(f"Error loading crop recommendation model or scalers: {e}")
    model_rec, sc_rec, mx_rec = None, None, None

# Define all possible crops for encoding
crop_categories = ["Crop_Barley", "Crop_Cotton", "Crop_Gram", "Crop_Groundnut",
                   "Crop_Maize", "Crop_Mustard", "Crop_Peas", "Crop_Pulses",
                   "Crop_Rice", "Crop_Soybean", "Crop_Sugarcane"]

# Crop-specific farming guides
CROP_GUIDES = {
    "Rice": {
        "soil_mgmt": {
            "whatToDo": [
                "Maintain water level of 5-10 cm during growing season",
                "Use well-decomposed organic manure 10-15 tonnes/hectare",
                "Conduct soil testing for pH (6.0-7.0 optimal)",
                "Apply zinc sulfate if deficiency detected"
            ],
            "doNotDo": [
                "Do not plant in waterlogged fields without drainage",
                "Avoid continuous monoculture",
                "Do not use contaminated water for irrigation",
                "Avoid nutrient imbalance"
            ],
            "pros": [
                "High demand in market",
                "Well-established supply chain",
                "Government support through MSP",
                "Suitable for flood-prone areas"
            ],
            "cons": [
                "High water requirement (1000-1500mm)",
                "Labor-intensive cultivation",
                "Disease management costs",
                "Requires leveled fields"
            ]
        },
        "water_mgmt": {
            "whatToDo": [
                "Use basin method for water conservation",
                "Install drip/sprinkler irrigation for better efficiency",
                "Schedule irrigation based on soil moisture (60-70%)",
                "Mulch fields to reduce evaporation"
            ],
            "doNotDo": [
                "Do not over-irrigate",
                "Avoid continuous flooding",
                "Do not ignore drainage issues",
                "Avoid stagnant water"
            ],
            "pros": [
                "Improves water use efficiency",
                "Reduces water bills significantly",
                "Better plant growth",
                "Disease reduction"
            ],
            "cons": [
                "Infrastructure investment needed",
                "Regular maintenance required",
                "Clogging issues in drip systems",
                "Initial setup costs"
            ]
        },
        "crop_mgmt": {
            "whatToDo": [
                "Use disease-resistant varieties",
                "Apply basal fertilizer (N:P:K = 60:30:30 kg/ha)",
                "Top dressing with urea at tillering stage",
                "Monitor for blast, brown spot, and sheath blight"
            ],
            "doNotDo": [
                "Do not use seeds with < 80% germination",
                "Avoid sowing in off-season",
                "Do not skip pest monitoring",
                "Avoid excessive nitrogen application"
            ],
            "pros": [
                "120-150 days crop duration",
                "3-4 tonnes/hectare yield potential",
                "Established market",
                "Easy storage and transport"
            ],
            "cons": [
                "Pest and disease pressure",
                "Weather dependent",
                "Drying and milling costs",
                "Price volatility"
            ]
        }
    },
    "Cotton": {
        "soil_mgmt": {
            "whatToDo": [
                "Test soil pH (6.0-7.5 optimal)",
                "Add sulfur for acidic soils",
                "Incorporate 5-10 tonnes FYM per hectare",
                "Ensure good drainage for root development"
            ],
            "doNotDo": [
                "Do not plant in waterlogged areas",
                "Avoid saline/alkaline soils",
                "Do not ignore soil preparation",
                "Avoid compact soil conditions"
            ],
            "pros": [
                "Less water requirement than rice",
                "Good for well-drained soils",
                "High market value",
                "Suitable for intercropping"
            ],
            "cons": [
                "High pesticide requirement",
                "Nitrogen-demanding crop",
                "Long growing season (180-220 days)",
                "Pest management intensive"
            ]
        },
        "water_mgmt": {
            "whatToDo": [
                "Provide 20-25 irrigations throughout season",
                "Use drip irrigation for 40-50% water saving",
                "Monitor soil moisture at 60cm depth",
                "Apply mulch to conserve moisture"
            ],
            "doNotDo": [
                "Do not irrigate during flowering",
                "Avoid water stagnation",
                "Do not over-irrigate at bud stage",
                "Avoid uneven water distribution"
            ],
            "pros": [
                "Drip irrigation highly suitable",
                "Water use efficiency up to 80%",
                "Soil moisture retention",
                "Reduced pest incidence"
            ],
            "cons": [
                "High irrigation cost",
                "Requires regular monitoring",
                "Infrastructure maintenance",
                "Initial investment high"
            ]
        },
        "crop_mgmt": {
            "whatToDo": [
                "Use Bt cotton varieties for pest resistance",
                "Apply NPK 150:75:75 kg/ha",
                "Monitor for bollworms, thrips regularly",
                "Harvest when 60% bolls open"
            ],
            "doNotDo": [
                "Do not use outdated varieties",
                "Avoid excessive nitrogen",
                "Do not skip disease monitoring",
                "Avoid harvesting immature bolls"
            ],
            "pros": [
                "High fiber yield per hectare",
                "Good export demand",
                "Cottonseed byproduct value",
                "Suitable for dryland farming"
            ],
            "cons": [
                "Insecticide costs high",
                "Pink bollworm management complex",
                "Seed cost higher",
                "Market price fluctuation"
            ]
        }
    },
    "Groundnut": {
        "soil_mgmt": {
            "whatToDo": [
                "Prepare soil to 20-25cm depth for pod development",
                "Add gypsum 500kg/ha for pod setting",
                "Maintain soil pH 6.0-7.0",
                "Incorporate 5 tonnes FYM per hectare"
            ],
            "doNotDo": [
                "Do not plant in clay soils",
                "Avoid waterlogged conditions",
                "Do not ignore gypsum application",
                "Avoid hard-pan soils"
            ],
            "pros": [
                "Improves soil fertility through nitrogen fixation",
                "Low water requirement",
                "Pod development requires specific soil condition",
                "Suitable for light soils"
            ],
            "cons": [
                "Requires deep soil preparation",
                "Gypsum application needed",
                "Labor-intensive harvesting",
                "Requires mechanical harvester"
            ]
        },
        "water_mgmt": {
            "whatToDo": [
                "Provide 4-5 irrigations throughout growing period",
                "Critical stage: 60-90 DAS (pod formation)",
                "Irrigate at 70% available soil moisture",
                "Drip irrigation saves 40% water"
            ],
            "doNotDo": [
                "Do not over-irrigate at early stage",
                "Avoid water during pod drying phase",
                "Do not ignore drainage",
                "Avoid stagnant water"
            ],
            "pros": [
                "Less water needy (400-500mm)",
                "Suitable for rainfed farming",
                "Drip irrigation very effective",
                "Water conservation possible"
            ],
            "cons": [
                "Moisture stress affects yields",
                "Requires timely irrigation",
                "Monitoring needed",
                "Storage of harvested pods difficult"
            ]
        },
        "crop_mgmt": {
            "whatToDo": [
                "Use JL-24, TG37A varieties for high yield",
                "Apply 25 kg N, 50 kg P2O5, 40 kg K2O/ha",
                "Monitor for leaf miner, thrips",
                "Harvest at 110-120 DAS when pods mature"
            ],
            "doNotDo": [
                "Do not plant in high rainfall areas",
                "Avoid late sowing",
                "Do not harvest immature pods",
                "Avoid poor quality seed"
            ],
            "pros": [
                "Short duration crop (110-120 days)",
                "High market demand",
                "Oil and seed protein rich",
                "Low pest pressure in dry climate"
            ],
            "cons": [
                "Aflatoxin contamination risk",
                "Harvesting labor required",
                "Post-harvest handling critical",
                "Price dependent on quality"
            ]
        }
    },
    "Wheat": {
        "soil_mgmt": {
            "whatToDo": [
                "Prepare field with 2-3 ploughing",
                "Incorporate 10 tonnes FYM per hectare",
                "Maintain soil pH 6.0-7.0",
                "Test soil for deficiencies"
            ],
            "doNotDo": [
                "Do not plant without field preparation",
                "Avoid waterlogged fields",
                "Do not ignore organic matter",
                "Avoid saline soils"
            ],
            "pros": [
                "Improves soil structure with residue",
                "Suitable for diverse soil types",
                "Good crop rotation option",
                "Tillage for weed management"
            ],
            "cons": [
                "Requires good soil preparation",
                "Labor intensive initially",
                "Pest management needed",
                "Herbicide use necessary"
            ]
        },
        "water_mgmt": {
            "whatToDo": [
                "Provide 4-5 irrigations (Sept-May)",
                "Critical stages: tillering, flowering, grain fill",
                "Apply 500mm water total",
                "Drip irrigation can save 30% water"
            ],
            "doNotDo": [
                "Do not irrigate at seed germination",
                "Avoid water stress at flowering",
                "Do not over-irrigate",
                "Avoid drainage issues"
            ],
            "pros": [
                "Rabi crop, uses seasonal rainfall",
                "Lower water requirement than rice",
                "Winter season reduces evaporation",
                "Gravity irrigation suitable"
            ],
            "cons": [
                "Irrigation infrastructure needed",
                "Electricity costs for pumping",
                "Timely water availability critical",
                "Excess water causes lodging"
            ]
        },
        "crop_mgmt": {
            "whatToDo": [
                "Use high-yielding varieties (HD2967, PBW621)",
                "Apply 100kg N, 60kg P2O5, 40kg K2O/ha",
                "Sow in October for optimal yield",
                "Monitor for rusts and Karnal bunt"
            ],
            "doNotDo": [
                "Do not sow late in season",
                "Avoid overcrowding plants",
                "Do not skip disease monitoring",
                "Avoid water stress at grain filling"
            ],
            "pros": [
                "Assured government procurement",
                "High yielding varieties available",
                "Established market channels",
                "Short duration (120-150 days)"
            ],
            "cons": [
                "Disease pressure in humid regions",
                "Weed management labor intensive",
                "Price controlled by government",
                "Pest monitoring required"
            ]
        }
    },
    "Sugarcane": {
        "soil_mgmt": {
            "whatToDo": [
                "Deep ploughing 4-5 times for 45cm depth",
                "Add 20-25 tonnes FYM per hectare",
                "Maintain soil pH 6.0-7.5",
                "Conduct soil testing for nutrients"
            ],
            "doNotDo": [
                "Do not plant in waterlogged areas",
                "Avoid saline/alkaline soils",
                "Do not skip soil preparation",
                "Avoid compacted soils"
            ],
            "pros": [
                "Improves soil structure deeply",
                "Organic matter builds up",
                "Allows deep root penetration",
                "Residue provides mulch"
            ],
            "cons": [
                "Very labor-intensive preparation",
                "High farm power requirement",
                "Considerable cost involved",
                "Time-consuming process"
            ]
        },
        "water_mgmt": {
            "whatToDo": [
                "Provide 35-40 irrigations per season",
                "Drip irrigation reduces water by 50%",
                "Monthly water requirement: 200-250mm",
                "Mulch to conserve soil moisture"
            ],
            "doNotDo": [
                "Do not allow water stress",
                "Avoid water stagnation",
                "Do not ignore drainage",
                "Avoid irregular irrigation"
            ],
            "pros": [
                "Drip irrigation highly suitable",
                "Water use efficiency reaches 80%",
                "Significant water saving possible",
                "Reduces weed growth"
            ],
            "cons": [
                "Very high water demand (1500-2000mm)",
                "Expensive irrigation infrastructure",
                "Regular maintenance needed",
                "Skill-based operation required"
            ]
        },
        "crop_mgmt": {
            "whatToDo": [
                "Plant certified bud chips/seed canes",
                "Apply 150kg N, 60kg P2O5, 120kg K2O/ha",
                "Monitor for shoot borer, top borer",
                "Harvest at 12-14 months for juice content"
            ],
            "doNotDo": [
                "Do not use poor quality seed material",
                "Avoid late planting",
                "Do not skip pest monitoring",
                "Avoid ratoon beyond 3 cycles"
            ],
            "pros": [
                "Perennial income source",
                "Ratooning possible 3-4 times",
                "Sugar industry provides stable market",
                "High income potential per hectare"
            ],
            "cons": [
                "Long crop duration (12-14 months)",
                "Pest and disease pressure high",
                "Harvesting labor intensive",
                "Soil fertility declines with time"
            ]
        }
    },
    "Maize": {
        "soil_mgmt": {
            "whatToDo": [
                "Prepare seedbed with 2-3 ploughing",
                "Add 5-10 tonnes FYM per hectare",
                "Maintain soil pH 6.0-7.0",
                "Ensure good drainage"
            ],
            "doNotDo": [
                "Do not plant in waterlogged soils",
                "Avoid highly acidic soils",
                "Do not ignore soil preparation",
                "Avoid compact soil conditions"
            ],
            "pros": [
                "Moderate soil requirements",
                "Fits well in crop rotation",
                "Improves soil structure",
                "Suitable for diverse soils"
            ],
            "cons": [
                "Requires good drainage",
                "Heavy feeder crop",
                "Soil depletion possible",
                "Pest population build-up"
            ]
        },
        "water_mgmt": {
            "whatToDo": [
                "Provide 8-10 irrigations",
                "Critical stages: tasseling, silking, grain fill",
                "Total water requirement: 600-750mm",
                "Drip irrigation suitable for efficiency"
            ],
            "doNotDo": [
                "Do not allow drought at flowering",
                "Avoid water stress during silking",
                "Do not over-irrigate",
                "Avoid water stagnation"
            ],
            "pros": [
                "Moderate water requirement",
                "Suitable for rainfed areas",
                "Drip irrigation effective",
                "Water use efficiency good"
            ],
            "cons": [
                "Flowering stage most critical",
                "Requires timely irrigation",
                "Stress causes yield loss",
                "Regular monitoring needed"
            ]
        },
        "crop_mgmt": {
            "whatToDo": [
                "Use hybrid varieties (Pioneer, Dekalb)",
                "Apply 120kg N, 60kg P2O5, 40kg K2O/ha",
                "Monitor for stem borer, aphids",
                "Harvest at physiological maturity"
            ],
            "doNotDo": [
                "Do not use low-quality seeds",
                "Avoid late planting",
                "Do not skip pest scouting",
                "Avoid harvesting immature grains"
            ],
            "pros": [
                "Short duration (100-120 days)",
                "High grain yield potential",
                "Dual purpose (grain + fodder)",
                "Growing market demand"
            ],
            "cons": [
                "Stem borer management costly",
                "Weather sensitive at flowering",
                "Seed cost high for hybrids",
                "Price volatility in market"
            ]
        }
    },
    "Gram": {
        "soil_mgmt": {
            "whatToDo": [
                "Use well-drained loamy soils",
                "Maintain soil pH 6.0-7.5",
                "Add 2-3 tonnes FYM per hectare",
                "Ensure good soil structure"
            ],
            "doNotDo": [
                "Do not plant in waterlogged areas",
                "Avoid alkaline soils",
                "Do not ignore soil preparation",
                "Avoid clay-heavy soils"
            ],
            "pros": [
                "Improves soil nitrogen content",
                "Good crop rotation option",
                "Suitable for light soils",
                "Enhances soil fertility"
            ],
            "cons": [
                "Requires good drainage",
                "Soil preparation moderate",
                "Drainage channels needed",
                "Cost of preparation"
            ]
        },
        "water_mgmt": {
            "whatToDo": [
                "Provide 2-3 irrigations total",
                "Apply at sowing, flowering, and pod fill",
                "Total water: 400-500mm",
                "Mulch to conserve moisture"
            ],
            "doNotDo": [
                "Do not over-irrigate",
                "Avoid water at vegetative stage",
                "Do not allow water stagnation",
                "Avoid excess moisture"
            ],
            "pros": [
                "Low water requirement",
                "Suitable for rainfed farming",
                "Minimal irrigation cost",
                "Water conservation possible"
            ],
            "cons": [
                "Sensitive to water stress at flowering",
                "Needs targeted irrigation",
                "Moisture stress reduces yields",
                "Difficult for flood-prone areas"
            ]
        },
        "crop_mgmt": {
            "whatToDo": [
                "Use tolerant varieties (JG315, GG1)",
                "Apply 20kg N, 50kg P2O5, 20kg K2O/ha",
                "Monitor for pod borer, heliothis",
                "Harvest at pod maturity (6-7 months)"
            ],
            "doNotDo": [
                "Do not sow in high rainfall areas",
                "Avoid late sowing",
                "Do not skip disease monitoring",
                "Avoid poor seed quality"
            ],
            "pros": [
                "Short duration (6-7 months)",
                "High protein content (20-22%)",
                "Good market demand",
                "Rainfed farming suitable"
            ],
            "cons": [
                "Pod borer damage significant",
                "Weather-dependent yields",
                "Price volatility",
                "Storage losses with moisture"
            ]
        }
    },
    "Mustard": {
        "soil_mgmt": {
            "whatToDo": [
                "Prepare soil with 2-3 ploughing",
                "Maintain soil pH 6.0-7.5",
                "Add 5 tonnes FYM per hectare",
                "Ensure good soil structure"
            ],
            "doNotDo": [
                "Do not plant in waterlogged areas",
                "Avoid saline soils",
                "Do not ignore seed bed preparation",
                "Avoid soil compaction"
            ],
            "pros": [
                "Suitable for diverse soils",
                "Good for soil health",
                "Fits rotation well",
                "Improves soil structure"
            ],
            "cons": [
                "Weed management intensive",
                "Requires good seedbed",
                "Pest pressure variable",
                "Weather sensitive"
            ]
        },
        "water_mgmt": {
            "whatToDo": [
                "Provide 3-4 irrigations",
                "Apply at sowing, flower bud, pod fill",
                "Total water: 300-400mm",
                "Use drip for efficiency"
            ],
            "doNotDo": [
                "Do not over-irrigate",
                "Avoid water at vegetative stage",
                "Do not allow water stagnation",
                "Avoid excess moisture"
            ],
            "pros": [
                "Low to moderate water need",
                "Suitable for rabi season",
                "Winter rains helpful",
                "Water use efficient"
            ],
            "cons": [
                "Sensitive to drought",
                "Needs targeted irrigation",
                "Excess water harmful",
                "Moisture stress reduces oil content"
            ]
        },
        "crop_mgmt": {
            "whatToDo": [
                "Use high-yielding varieties (Rohini, Ashirwad)",
                "Apply 40kg N, 80kg P2O5, 40kg K2O/ha",
                "Monitor for aphids, sawfly",
                "Harvest at pod maturity (4.5-5 months)"
            ],
            "doNotDo": [
                "Do not use poor quality seeds",
                "Avoid late sowing",
                "Do not skip pest monitoring",
                "Avoid harvesting green seeds"
            ],
            "pros": [
                "Short duration (4.5-5 months)",
                "High oil content (38-42%)",
                "Good market value",
                "Dual purpose (oil + meal)"
            ],
            "cons": [
                "Aphid infestation common",
                "Harvesting labor intensive",
                "Seed shattering loss",
                "Price fluctuation"
            ]
        }
    }
}

def get_crop_guide(crop_name):
    """Return crop-specific guide or default"""
    return CROP_GUIDES.get(crop_name, CROP_GUIDES["Rice"])  # Default to Rice if crop not found

@app.route("/")
def home():
    return jsonify({"message": "Crop Yield Prediction API is running!"})

@app.route("/predict", methods=["POST"])
def predict():
    try:
        # Get data from request
        data = request.get_json()

        # Validate input
        required_fields = ["Rainfall", "Area", "District_Name", "Season_Encoded", "Soil_Quality_Encoded", "Crop"]
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing fields in request"}), 400

        # Encode categorical features
        district_encoded = encoder_district.transform([[data["District_Name"]]])[0][0]
        season_encoded = encoder_season.transform([[data["Season_Encoded"]]])[0][0]
        soil_encoded = encoder_soil.transform([[data["Soil_Quality_Encoded"]]])[0][0]

        # Initialize all crop columns with 0
        crop_input = {crop: 0 for crop in crop_categories}
        selected_crop = "Crop_" + data["Crop"]
        if selected_crop in crop_input:
            crop_input[selected_crop] = 1  # Set 1 for the present crop

        # Create input feature array
        input_features = np.array([
            data["Rainfall"],
            data["Area"],
            district_encoded,
            season_encoded,
            soil_encoded
        ] + list(crop_input.values())).reshape(1, -1)

        # Apply scaling
        feature_names = ["Rainfall", "Area", "District_Name", "Season_Encoded", "Soil_Quality_Encoded"] + crop_categories
        input_df = pd.DataFrame(input_features, columns=feature_names)
        input_features = scaler.transform(input_df)

        # Predict Production
        predicted_production = model.predict(input_features)
        production_value = float(predicted_production[0])
        
        # Calculate additional metrics
        area = float(data["Area"])
        rainfall = float(data["Rainfall"])
        yield_per_hectare = production_value / area if area > 0 else 0
        
        # Calculate soil quality score (0-100)
        soil_quality_map = {"Poor": 30, "Moderate": 65, "Good": 90}
        soil_quality_score = soil_quality_map.get(data["Soil_Quality_Encoded"], 50)
        
        # Calculate rainfall efficiency (0-100)
        rainfall_efficiency = min((rainfall / 800) * 100, 100)  # 800mm is optimal
        
        # Calculate area utilization score
        area_efficiency = min((area / 50) * 100, 100)  # 50 hectares is optimal
        
        # Overall sustainability score
        overall_score = (soil_quality_score + rainfall_efficiency + area_efficiency) / 3
        
        # Generate recommendations
        recommendations = []
        if rainfall < 600:
            recommendations.append("Rainfall is below optimal. Consider irrigation.")
        if rainfall > 1000:
            recommendations.append("High rainfall detected. Ensure proper drainage.")
        if soil_quality_score < 50:
            recommendations.append("Soil quality is poor. Consider soil amendments.")
        if area < 5:
            recommendations.append("Small farm size. Focus on high-value crops.")
        if production_value < 10:
            recommendations.append("Low predicted yield. Review farming practices.")

        # Get crop-specific guide
        crop_guide = get_crop_guide(data["Crop"])

        return jsonify({
            "predicted_production": production_value,
            "yield_per_hectare": round(yield_per_hectare, 2),
            "area": area,
            "rainfall": rainfall,
            "crop": data["Crop"],
            "district": data["District_Name"],
            "season": data["Season_Encoded"],
            "soil_quality": data["Soil_Quality_Encoded"],
            "soil_quality_score": soil_quality_score,
            "rainfall_efficiency": round(rainfall_efficiency, 2),
            "area_efficiency": round(area_efficiency, 2),
            "overall_sustainability_score": round(overall_score, 2),
            "recommendations": recommendations if recommendations else ["Farming conditions are optimal!"],
            "farmer_guide": crop_guide
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/recommend_crop", methods=["POST"])
def recommend_crop():
    try:
        # Get data from request
        data = request.get_json()

        # Validate input for recommendation
        required_fields = ["Nitrogen", "Phosporus", "Potassium", "Temperature", "Humidity", "pH", "Rainfall"]
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing fields in request"}), 400

        # Extract features from the JSON data
        N = data.get('Nitrogen')
        P = data.get('Phosporus')
        K = data.get('Potassium')
        temp = data.get('Temperature')
        humidity = data.get('Humidity')
        ph = data.get('pH')
        rainfall = data.get('Rainfall')

        # Prepare the input for the recommendation model
        feature_list = [float(N), float(P), float(K), float(temp), float(humidity), float(ph), float(rainfall)]
        single_pred = np.array(feature_list).reshape(1, -1)

        # Scale the input data
        mx_features = mx_rec.transform(single_pred)
        sc_mx_features = sc_rec.transform(mx_features)

        # Make recommendation prediction
        prediction = model_rec.predict(sc_mx_features)

        # Map prediction to crop names
        crop_dict = {
            1: "Rice", 2: "Maize", 3: "Jute", 4: "Cotton", 5: "Coconut", 
            6: "Papaya", 7: "Orange", 8: "Apple", 9: "Muskmelon", 10: "Watermelon",
            11: "Grapes", 12: "Mango", 13: "Banana", 14: "Pomegranate", 
            15: "Lentil", 16: "Blackgram", 17: "Mungbean", 18: "Mothbeans", 
            19: "Pigeonpeas", 20: "Kidneybeans", 21: "Chickpea", 22: "Coffee"
        }

        if prediction[0] in crop_dict:
            crop = crop_dict[prediction[0]]
            result = f"{crop} is the best crop to be cultivated."
        else:
            result = "Sorry, we could not determine the best crop to be cultivated with the provided data."

        return jsonify({"recommended_crop": result})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Real-time Weather and Environmental Data API
@app.route('/api/weather', methods=['POST', 'OPTIONS'])
def get_weather_data():
    """
    Get real-time weather data for a location
    Input: {
        "district": "Pune",
        "state": "Maharashtra",
        "latitude": (optional, float),
        "longitude": (optional, float)
    }
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.json
        district = data.get('district', '')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        print(f"[Weather API] Request received for district: {district}, lat: {latitude}, lon: {longitude}")
        longitude = data.get('longitude')
        
        # District coordinates mapping for Maharashtra
        district_coords = {
            "Pune": (18.5204, 73.8567),
            "Mumbai": (19.0760, 72.8777),
            "Nagpur": (21.1458, 79.0882),
            "Aurangabad": (19.8762, 75.3433),
            "Nashik": (19.9975, 73.7898),
            "Ahmednagar": (19.0841, 74.7421),
            "Solapur": (17.6599, 75.9064),
            "Kolhapur": (16.7050, 73.7331),
            "Ratnagiri": (16.9891, 73.3128),
            "Sindhudurg": (16.3975, 73.6675),
            "Sangli": (16.8507, 74.5627),
            "Satara": (17.6761, 73.9197),
            "Yavatmal": (20.4248, 78.1357),
            "Wardha": (20.7468, 78.6006),
            "Akola": (20.7136, 77.0066),
            "Amravati": (20.9517, 77.7597),
            "Buldhana": (20.5544, 76.1797),
            "Washim": (20.1033, 76.8157),
            "Jalgaon": (21.1781, 75.5597),
            "Dhule": (21.1975, 74.7742),
            "Nandurbar": (21.3803, 74.2453),
            "Gondia": (21.4515, 80.1925),
            "Bhandara": (21.1768, 79.2502),
            "Chandrapur": (19.2841, 79.3057),
            "Latur": (18.4088, 76.3764),
            "Parbhani": (19.2683, 76.7597),
            "Hingoli": (19.7271, 77.1453),
            "Vikarabad": (19.2783, 75.1385),
            "Kannada": (19.2241, 75.5250),
            "Beed": (19.2183, 75.7597),
            "Usmanabad": (18.3706, 76.7597),
            "Indore": (22.7196, 75.8577),
        }
        
        # Get coordinates
        if latitude and longitude:
            lat, lon = float(latitude), float(longitude)
        else:
            district_name = district.strip().title()
            if district_name in district_coords:
                lat, lon = district_coords[district_name]
            else:
                print(f"[Weather API] District not found: {district}")
                return jsonify({"error": f"District '{district}' not found"}), 400
        
        print(f"[Weather API] Using coordinates - lat: {lat}, lon: {lon}")
        
        # Fetch weather data from Open-Meteo (free, no API key needed)
        # This service provides accurate weather without rate limiting
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,pressure_msl&timezone=Asia/Kolkata"
        
        print(f"[Weather API] Fetching from Open-Meteo: lat={lat}, lon={lon}")
        response = requests.get(url, timeout=10)
        print(f"[Weather API] Response status: {response.status_code}")
        
        if response.status_code != 200:
            # No fallback - return error so frontend knows API is down
            print(f"[Weather API] API request failed with status {response.status_code}")
            return jsonify({
                "error": f"Weather API unavailable (status {response.status_code})",
                "district": district
            }), response.status_code
        
        weather = response.json()
        current = weather.get('current', {})
        
        # Map WMO weather codes to descriptions
        wmo_codes = {
            0: "Clear sky", 1: "Partly cloudy", 2: "Partly cloudy", 3: "Overcast",
            45: "Foggy", 48: "Foggy", 51: "Light drizzle", 53: "Moderate drizzle", 55: "Heavy drizzle",
            61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain", 71: "Slight snow",
            73: "Moderate snow", 75: "Heavy snow", 77: "Snow grains", 80: "Slight rain showers",
            81: "Moderate rain showers", 82: "Violent rain showers", 85: "Slight snow showers",
            86: "Heavy snow showers", 95: "Thunderstorm", 96: "Thunderstorm with hail",
            99: "Thunderstorm with hail"
        }
        
        weather_code = current.get('weather_code', 0)
        description = wmo_codes.get(weather_code, "Unknown")
        
        # Extract relevant data from Open-Meteo
        weather_data = {
            "status": "success",
            "temperature": round(current.get('temperature_2m', 0), 1),
            "humidity": current.get('relative_humidity_2m', 0),
            "wind_speed": round(current.get('wind_speed_10m', 0), 2),
            "pressure": round(current.get('pressure_msl', 1013), 1),
            "description": description,
            "weather_code": weather_code,
            "district": district,
            "latitude": lat,
            "longitude": lon,
            "season": get_current_season(),
            "timezone": weather.get('timezone', 'Asia/Kolkata'),
            "timestamp": datetime.now().isoformat()
        }
        
        print(f"[Weather API] Success - Temperature: {weather_data['temperature']}°C, Humidity: {weather_data['humidity']}%")
        return jsonify(weather_data), 200
        
    except requests.exceptions.Timeout:
        print("[Weather API] Request timeout - Open-Meteo API unavailable")
        return jsonify({
            "error": "Weather service timeout",
            "district": data.get('district', '') if data else ''
        }), 504
    except requests.exceptions.ConnectionError:
        print("[Weather API] Connection error - Cannot reach Open-Meteo API")
        return jsonify({
            "error": "Cannot connect to weather service",
            "district": data.get('district', '') if data else ''
        }), 503
    except Exception as e:
        print(f"[Weather API] Exception occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Error fetching weather: {str(e)}"}), 500


def get_current_season():
    """Determine current season for Maharashtra"""
    month = datetime.now().month
    
    # Maharashtra farming seasons
    if month in [6, 7, 8, 9]:  # June-September
        return "Monsoon (Kharif)"
    elif month in [10, 11, 12, 1]:  # October-January
        return "Winter (Rabi)"
    else:  # February-May
        return "Summer"


# Environmental Data Summary API
@app.route('/api/environmental-summary', methods=['POST'])
def get_environmental_summary():
    """
    Get comprehensive environmental data including weather, season, and recommendations
    Input: {
        "district": "Pune",
        "soil_type": "Loamy",
        "area": 5.5
    }
    """
    try:
        data = request.json
        district = data.get('district', '')
        soil_type = data.get('soil_type', 'Unknown')
        area = data.get('area', 0)
        
        # Get weather data
        weather_response = requests.post(
            'http://localhost:5000/api/weather',
            json={"district": district},
            timeout=10
        )
        
        if weather_response.status_code == 200:
            weather_data = weather_response.json()
        else:
            weather_data = {
                "temperature": 28,
                "humidity": 65,
                "rainfall": 100,
                "season": get_current_season()
            }
        
        # Environmental summary
        summary = {
            "district": district,
            "soil_type": soil_type,
            "area_hectares": area,
            "current_temperature": weather_data.get('temperature', 28),
            "humidity_percent": weather_data.get('humidity', 65),
            "recent_rainfall_mm": weather_data.get('rain', 0),
            "wind_speed_kmh": weather_data.get('wind_speed', 12),
            "current_season": weather_data.get('season', get_current_season()),
            "weather_description": weather_data.get('description', 'Unknown'),
            "cloud_cover_percent": weather_data.get('cloud_cover', 40),
            "timestamp": datetime.now().isoformat(),
            "environmental_recommendations": get_environmental_recommendations(
                weather_data.get('temperature', 28),
                weather_data.get('humidity', 65),
                weather_data.get('season', ''),
                soil_type
            )
        }
        
        return jsonify(summary), 200
        
    except Exception as e:
        return jsonify({"error": f"Error: {str(e)}"}), 500


def get_environmental_recommendations(temp, humidity, season, soil_type):
    """Generate recommendations based on environmental conditions"""
    recommendations = []
    
    # Temperature recommendations
    if temp < 15:
        recommendations.append("Temperature is low. Consider frost protection measures.")
    elif temp > 35:
        recommendations.append("High temperature detected. Ensure adequate irrigation.")
    else:
        recommendations.append(f"Temperature {temp}°C is suitable for farming.")
    
    # Humidity recommendations
    if humidity < 30:
        recommendations.append("Low humidity. Increase watering frequency.")
    elif humidity > 85:
        recommendations.append("High humidity. Monitor crops for fungal diseases.")
    else:
        recommendations.append(f"Humidity {humidity}% is optimal for crop growth.")
    
    # Season-based recommendations
    season_tips = {
        "Monsoon (Kharif)": "Good season for water-dependent crops. Ensure proper drainage.",
        "Winter (Rabi)": "Ideal for cool-season crops. Protect from frost.",
        "Summer": "Plant drought-resistant varieties. Plan irrigation."
    }
    
    if season in season_tips:
        recommendations.append(season_tips[season])
    
    # Soil-based recommendations
    if soil_type == "Clay":
        recommendations.append("Clay soil: Improve drainage, add organic matter.")
    elif soil_type == "Sandy":
        recommendations.append("Sandy soil: Increase water retention, use mulch.")
    elif soil_type == "Loamy":
        recommendations.append("Loamy soil: Ideal for most crops. Maintain organic matter.")
    
    return recommendations


# Crop Market Data API
@app.route('/api/crop-market-trends', methods=['POST', 'OPTIONS'])
def get_crop_market_trends():
    """
    Get real-time market trends and prices for a selected crop
    Input: {
        "crop": "Rice",
        "state": "Maharashtra"
    }
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.json
        crop = data.get('crop', '').strip()
        state = data.get('state', 'Maharashtra').strip()
        
        print(f"[Market API] Request for crop: {crop}, state: {state}")
        
        # Simulate real market data based on crop type
        # In production, this would integrate with actual market APIs like:
        # - AGMARKNET (Agricultural Marketing Network)
        # - NCDEX (National Commodity & Derivatives Exchange)
        # - MANDI pricing data
        
        crop_market_data = {
            "Rice": {
                "avg_price": 2850,  # ₹ per quintal
                "min_price": 2650,
                "max_price": 3050,
                "trend": "↑ Upward",
                "change_percent": 3.5,
                "volume": 125000,  # quintals
                "unit": "per quintal"
            },
            "Wheat": {
                "avg_price": 2100,
                "min_price": 1950,
                "max_price": 2250,
                "trend": "→ Stable",
                "change_percent": 0.8,
                "volume": 95000,
                "unit": "per quintal"
            },
            "Cotton": {
                "avg_price": 5500,
                "min_price": 5200,
                "max_price": 5800,
                "trend": "↓ Downward",
                "change_percent": -2.1,
                "volume": 45000,
                "unit": "per quintal"
            },
            "Groundnut": {
                "avg_price": 5800,
                "min_price": 5400,
                "max_price": 6200,
                "trend": "↑ Upward",
                "change_percent": 2.8,
                "volume": 38000,
                "unit": "per quintal"
            },
            "Sugarcane": {
                "avg_price": 3200,
                "min_price": 3000,
                "max_price": 3400,
                "trend": "↑ Upward",
                "change_percent": 1.5,
                "volume": 520000,
                "unit": "per tonne"
            },
            "Maize": {
                "avg_price": 1850,
                "min_price": 1700,
                "max_price": 2000,
                "trend": "→ Stable",
                "change_percent": 0.2,
                "volume": 115000,
                "unit": "per quintal"
            },
            "Soybean": {
                "avg_price": 4200,
                "min_price": 3900,
                "max_price": 4500,
                "trend": "↑ Upward",
                "change_percent": 2.2,
                "volume": 42000,
                "unit": "per quintal"
            },
            "Pulses": {
                "avg_price": 6500,
                "min_price": 6000,
                "max_price": 7000,
                "trend": "↑ Upward",
                "change_percent": 4.1,
                "volume": 65000,
                "unit": "per quintal"
            },
            "Gram": {
                "avg_price": 5200,
                "min_price": 4800,
                "max_price": 5600,
                "trend": "→ Stable",
                "change_percent": 0.5,
                "volume": 28000,
                "unit": "per quintal"
            },
            "Mustard": {
                "avg_price": 5100,
                "min_price": 4700,
                "max_price": 5500,
                "trend": "↓ Downward",
                "change_percent": -1.2,
                "volume": 35000,
                "unit": "per quintal"
            },
            "Barley": {
                "avg_price": 1600,
                "min_price": 1450,
                "max_price": 1750,
                "trend": "→ Stable",
                "change_percent": 0.3,
                "volume": 18000,
                "unit": "per quintal"
            },
            "Peas": {
                "avg_price": 4500,
                "min_price": 4100,
                "max_price": 4900,
                "trend": "↑ Upward",
                "change_percent": 3.2,
                "volume": 22000,
                "unit": "per quintal"
            }
        }
        
        # Get crop data or return default if not found
        if crop in crop_market_data:
            market_data = crop_market_data[crop]
        else:
            print(f"[Market API] Crop not found: {crop}")
            return jsonify({"error": f"Market data not available for {crop}"}), 404
        
        # Calculate price trend insights
        price_insight = ""
        if market_data["change_percent"] > 2:
            price_insight = "Good opportunity to sell - prices trending up"
        elif market_data["change_percent"] > 0:
            price_insight = "Prices gradually improving"
        elif market_data["change_percent"] > -2:
            price_insight = "Prices slightly declining - monitor market"
        else:
            price_insight = "Prices declining - consider alternative crops"
        
        # Generate market recommendations
        recommendations = []
        if market_data["change_percent"] > 2:
            recommendations.append("✅ High demand - strong selling opportunity")
            recommendations.append("📈 Prices showing upward trend")
        elif market_data["change_percent"] < -2:
            recommendations.append("⚠️ Prices declining - consider storage or alternative crops")
            recommendations.append("📉 Market oversupply situation")
        else:
            recommendations.append("➡️ Market stable - regular trading conditions")
        
        if market_data["volume"] > 100000:
            recommendations.append("💹 High trading volume - good liquidity")
        else:
            recommendations.append("📊 Moderate trading volume")
        
        # Build a mock trend series (last 14 days) around average price
        trend_days = 14
        avg = market_data["avg_price"]
        change_pct = market_data.get("change_percent", 0) / 100.0
        trend_series = []
        for i in range(trend_days - 1, -1, -1):
            day = datetime.now() - timedelta(days=i)
            # small random daily volatility plus a bias from overall change_percent
            daily_vol = random.uniform(-0.01, 0.01)
            trend_bias = (i / trend_days) * change_pct  # recent days reflect change
            price = avg * (1 + trend_bias + daily_vol)
            # clamp to min/max
            price = max(market_data["min_price"], min(market_data["max_price"], round(price)))
            trend_series.append({"date": day.strftime('%Y-%m-%d'), "price": price})

        # Prepare response
        response_data = {
            "status": "success",
            "crop": crop,
            "state": state,
            "market_data": {
                "average_price": market_data["avg_price"],
                "minimum_price": market_data["min_price"],
                "maximum_price": market_data["max_price"],
                "price_unit": market_data["unit"],
                "trend": market_data["trend"],
                "price_change_percent": market_data["change_percent"],
                "trading_volume": market_data["volume"],
                "price_insight": price_insight
            },
            "trend_series": trend_series,
            "recommendations": recommendations,
            "last_updated": datetime.now().isoformat(),
            "data_source": "Agricultural Market Network (AGMARKNET) - Simulated"
        }
        
        print(f"[Market API] Success - Average Price: ₹{market_data['avg_price']}/{market_data['unit']}")
        return jsonify(response_data), 200
        
    except Exception as e:
        print(f"[Market API] Exception occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Error fetching market data: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True)
