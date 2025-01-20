from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv
from flask_cors import CORS

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend-backend communication

API_KEY = os.getenv('WEATHER_API_KEY')
BASE_URL = "https://api.openweathermap.org/data/2.5/weather"
FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/weather', methods=['GET'])
def get_weather():
    city = request.args.get('city')
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    try:
        if city:
            url = f"{BASE_URL}?q={city}&units=metric&appid={API_KEY}"
        elif lat and lon:
            url = f"{BASE_URL}?lat={lat}&lon={lon}&units=metric&appid={API_KEY}"
        else:
            return jsonify({"error": "City or coordinates are required"}), 400

        response = requests.get(url)
        response.raise_for_status()  # Raise error for bad responses
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

@app.route('/forecast', methods=['GET'])
def get_forecast():
    city = request.args.get('city')
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    try:
        if city:
            url = f"{FORECAST_URL}?q={city}&units=metric&appid={API_KEY}"
        elif lat and lon:
            url = f"{FORECAST_URL}?lat={lat}&lon={lon}&units=metric&appid={API_KEY}"
        else:
            return jsonify({"error": "City or coordinates are required"}), 400

        response = requests.get(url)
        response.raise_for_status()  # Raise error for bad responses
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
