from flask import Flask, jsonify, request
from flask_cors import CORS
from data_fetcher import DataFetcher
from feature_engineer import CertificateRecommenderFeaturizer
from certificates_recommender import CertificateRecommender
import numpy as np
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize components
data_fetcher_url = os.getenv("DATA_API_URL")
data_fetcher = DataFetcher(data_fetcher_url)
featurizer = CertificateRecommenderFeaturizer(data_fetcher)
recommender = CertificateRecommender()

# Pre-load certificates and skills
certificates = data_fetcher.get_all_certificates()
certificates_with_skills = [
    {
        "id": cert["certificate_id"],
        "skills": data_fetcher.get_certificate_skills(cert["certificate_id"]),
    }
    for cert in certificates
]

# Train recommender
recommender.train(certificates_with_skills)


@app.route("/recommend/certificates/<int:user_id>", methods=["GET"])
def recommend_certificates(user_id: int):
    try:
        # Get user data
        user_data = data_fetcher.get_user_data(user_id)
        print(f"User Data: {user_data}")

        certificates_data = user_data.get("certificates", {})

        # Get IDs to exclude
        if (
            isinstance(certificates_data, dict)
            and "certificate_id" in certificates_data
        ):
            exclude_ids = certificates_data["certificate_id"]
        else:
            exclude_ids = [
                c["certificate_id"] for c in certificates_data if "certificate_id" in c
            ]
        print(f"Exclude IDs: {exclude_ids}")

        # Create feature vector
        all_skills = recommender.skill_ids
        print(f"All Skills found in all certificates: {all_skills}")

        user_vector = featurizer.create_user_vector(user_data, all_skills)
        print(f"User Vector: {user_vector}")

        # Get recommendations
        recommendations = recommender.recommend(user_vector, exclude_ids)

        return jsonify(
            {
                "user_id": user_id,
                "recommendations": recommendations,
                "diagnostics": {  # Add diagnostic info
                    "user_skills": user_data.get("skills", []),
                    "user_certificates": user_data.get("certificates", []),
                    "user_courses": user_data.get("courses", []),
                    "user_positions": user_data.get("positions", []),
                    "user_goals": user_data.get("goals", []),
                },
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    PORT = os.getenv("FLASK_RUN_PORT")
    HOST = os.getenv("FLASK_RUN_HOST")
    URL = os.getenv("FLASK_API_URL")
    print("\n\n=== API READY ===")
    print(f"Access at: {URL}")
    print("Press CTRL+C to stop\n")
    app.run(host=HOST, port=PORT, debug=True)
