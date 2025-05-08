from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS
import pandas as pd
import pickle

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

        return jsonify({"predicted_production": float(predicted_production[0])})

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


if __name__ == "__main__":
    app.run(debug=True)
