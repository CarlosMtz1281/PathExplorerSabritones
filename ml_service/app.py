from flask import Flask, jsonify, request
from flask_cors import CORS
from data_fetcher import DataFetcher
from feature_engineer import RecommenderFeaturizer
from certificates_recommender import CertificateRecommender
from positions_recommender import PositionsRecommender
import numpy as np
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize components
data_fetcher_url = os.getenv("DATA_API_URL_HOST_DOCKER")
data_fetcher = DataFetcher(data_fetcher_url)
featurizer = RecommenderFeaturizer(data_fetcher)
certificateRecommender = CertificateRecommender()
positionsRecommender = PositionsRecommender()

skills = data_fetcher.get_all_skills()

# Pre-load certificates and skills
certificates = data_fetcher.get_all_certificates()
certificates_with_skills = [
    {
        "id": cert["certificate_id"],
        "skills": data_fetcher.get_certificate_skills(cert["certificate_id"]),
        "provider": cert.get("provider"),
    }
    for cert in certificates
]

certificate_provider_map = {
    cert["id"]: cert["provider"] for cert in certificates_with_skills
}

certificateRecommender.train(certificates_with_skills)


positions = data_fetcher.get_all_positions()
positions_with_skills = [
    {
        "id": position["position_id"],
        "skills": data_fetcher.get_position_skills(position["position_id"]),
    }
    for position in positions
]
positionsRecommender.train(positions_with_skills)


def noUser(user_data):
    all_empty = all(
        (
            not user_data[key] or all(not v for v in user_data[key].values())
            if isinstance(user_data[key], dict)
            else not user_data[key]
        )
        for key in user_data
    )

    if all_empty:
        return True

    return False


@app.route(
    "/recommend/certificates/<int:user_id>",
    methods=["GET"],
)
def recommend_certificates(user_id: int):
    try:
        user_data = data_fetcher.get_user_data(user_id)
        if noUser(user_data):
            return jsonify({"error": "User not found"}), 404

        certificates_data = user_data.get("certificates", {})

        if (
            isinstance(certificates_data, dict)
            and "certificate_id" in certificates_data
        ):
            exclude_ids = certificates_data["certificate_id"]
        else:
            exclude_ids = [
                c["certificate_id"] for c in certificates_data if "certificate_id" in c
            ]

        existing_providers = list(
            set(
                certificate_provider_map[cert_id]
                for cert_id in exclude_ids
                if cert_id in certificate_provider_map
            )
        )

        user_skill_ids = set()
        user_skill_ids.update(user_data.get("skills", {}).get("skills_id", []))
        user_skill_ids.update(user_data.get("certificates", {}).get("skills_id", []))
        user_skill_ids.update(user_data.get("positions", {}).get("skills_id", []))

        all_skills = certificateRecommender.skill_ids

        user_vector = featurizer.create_user_vector(user_data, all_skills)

        recommendations = certificateRecommender.recommend(
            user_vector, exclude_ids, existing_providers, diversity_lambda=0.85
        )

        certificatesDict = data_fetcher.get_all_certificates()

        recommendations = [
            {
                "certificate_id": cert["certificate_id"],
                "certificate_name": next(
                    (
                        cert_data["certificate_name"]
                        for cert_data in certificatesDict
                        if cert_data["certificate_id"] == cert["certificate_id"]
                    ),
                    None,
                ),
                "certificate_desc": next(
                    (
                        cert_data["certificate_desc"]
                        for cert_data in certificatesDict
                        if cert_data["certificate_id"] == cert["certificate_id"]
                    )
                ),
                "provider": certificate_provider_map.get(cert["certificate_id"]),
                "score": cert["mmr_score"],
                "skills": [
                    skill["skill_name"]
                    for skill in data_fetcher.get_certificate_skills(
                        cert["certificate_id"]
                    )
                ],
                "coincident_skills": [
                    skill["skill_name"]
                    for skill in data_fetcher.get_certificate_skills(
                        cert["certificate_id"]
                    )
                    if skill["skill_id"] in user_skill_ids
                ],
                "certificate_estimated_time": next(
                    (
                        cert_data["certificate_estimated_time"]
                        for cert_data in certificatesDict
                        if cert_data["certificate_id"] == cert["certificate_id"]
                    ),
                    None,
                ),
                "certificate_level": next(
                    (
                        cert_data["certificate_level"]
                        for cert_data in certificatesDict
                        if cert_data["certificate_id"] == cert["certificate_id"]
                    ),
                    None,
                ),
            }
            for cert in recommendations
        ][:5]

        return jsonify(
            {
                "user_id": user_id,
                "user_skills": [
                    skill["skill_name"]
                    for skill in skills
                    if skill["skill_id"] in user_skill_ids
                ],
                "recommendations": recommendations,
            }
        )

    except Exception as e:
        return jsonify({"error": e}), 500


@app.route(
    "/recommend/positions/<int:user_id>",
    methods=["GET"],
)
def recommend_positions(user_id: int):
    try:
        # Get user data
        user_data = data_fetcher.get_user_data(user_id)
        if noUser(user_data):
            return jsonify({"error": "User not found"}), 404

        position_data = user_data.get("positions", {})

        if isinstance(position_data, dict) and "position_id" in position_data:
            exclude_ids = position_data["position_id"]
        else:
            exclude_ids = [
                p["position_id"] for p in position_data if "position_id" in p
            ]

        user_skill_ids = set()
        user_skill_ids.update(user_data.get("skills", {}).get("skills_id", []))
        user_skill_ids.update(user_data.get("certificates", {}).get("skills_id", []))
        user_skill_ids.update(user_data.get("positions", {}).get("skills_id", []))

        # Create feature vector
        all_skills = positionsRecommender.skills_ids

        user_vector = featurizer.create_user_vector(user_data, all_skills)

        # Get recommendations
        recommendations = positionsRecommender.recommend(
            user_vector, exclude_ids, diversity_lambda=0.85
        )

        positionsDict = data_fetcher.get_all_positions()

        recommendations = [
            {
                "position_id": position["position_id"],
                "position_name": next(
                    (
                        position_data["position_name"]
                        for position_data in positionsDict
                        if position_data["position_id"] == position["position_id"]
                    ),
                    None,
                ),
                "position_description": next(
                    (
                        position_data["position_desc"]
                        for position_data in positionsDict
                        if position_data["position_id"] == position["position_id"]
                    )
                ),
                "score": position["mmr_score"],
                "skills": [
                    skill["skill_name"]
                    for skill in data_fetcher.get_position_skills(
                        position["position_id"]
                    )
                ],
                "coincident_skills": [
                    skill["skill_name"]
                    for skill in data_fetcher.get_position_skills(
                        position["position_id"]
                    )
                    if skill["skill_id"] in user_skill_ids
                ],
            }
            for position in recommendations
        ]

        return jsonify(
            {
                "user_id": user_id,
                "user_skills": [
                    skill["skill_name"]
                    for skill in skills
                    if skill["skill_id"] in user_vector
                ],
                "recommendations": recommendations,
            }
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    PORT = os.getenv("FLASK_RUN_PORT")
    HOST = os.getenv("FLASK_RUN_HOST")
    URL = os.getenv("FLASK_API_URL")
    app.run(host=HOST, port=PORT, debug=True)
