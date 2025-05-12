from flask import Flask, jsonify, request
from flask_cors import CORS
from data_fetcher import DataFetcher
from feature_engineer import RecommenderFeaturizer
from certificates_recommender import CertificateRecommender
from courses_recommender import CoursesRecommender
import numpy as np
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize components
data_fetcher_url = os.getenv("DATA_API_URL")
data_fetcher = DataFetcher(data_fetcher_url)
featurizer = RecommenderFeaturizer(data_fetcher)
certificateRecommender = CertificateRecommender()
coursesRecommender = CoursesRecommender()

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


courses = data_fetcher.get_all_courses()
courses_with_skills = [
    {
        "id": course["course_id"],
        "skills": data_fetcher.get_course_skills(course["course_id"]),
    }
    for course in courses
]

coursesRecommender.train(courses_with_skills)


@app.route(
    "/recommend/certificates/<int:user_id>",
    methods=["GET"],
)
def recommend_certificates(user_id: int):
    try:
        user_data = data_fetcher.get_user_data(user_id)

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
        user_skill_ids.update(user_data.get("courses", {}).get("skills_id", []))
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
                "certificate_description": next(
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
            }
            for cert in recommendations
        ]

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
        return jsonify({"error": str(e)}), 500


@app.route(
    "/recommend/courses/<int:user_id>",
    methods=["GET"],
)
def recommend_courses(user_id: int):
    try:
        # Get user data
        user_data = data_fetcher.get_user_data(user_id)

        course_data = user_data.get("courses", {})

        if isinstance(course_data, dict) and "course_id" in course_data:
            exclude_ids = course_data["course_id"]
        else:
            exclude_ids = [c["course_id"] for c in course_data if "course_id" in c]

        user_skill_ids = set()
        user_skill_ids.update(user_data.get("skills", {}).get("skills_id", []))
        user_skill_ids.update(user_data.get("certificates", {}).get("skills_id", []))
        user_skill_ids.update(user_data.get("courses", {}).get("skills_id", []))
        user_skill_ids.update(user_data.get("positions", {}).get("skills_id", []))

        # Create feature vector
        all_skills = coursesRecommender.skills_ids

        user_vector = featurizer.create_user_vector(user_data, all_skills)

        # Get recommendations
        recommendations = coursesRecommender.recommend(
            user_vector, exclude_ids, diversity_lambda=0.85
        )

        coursesDict = data_fetcher.get_all_courses()

        recommendations = [
            {
                "course_id": course["course_id"],
                "course_name": next(
                    (
                        course_data["course_name"]
                        for course_data in coursesDict
                        if course_data["course_id"] == course["course_id"]
                    ),
                    None,
                ),
                "course_description": next(
                    (
                        course_data["course_desc"]
                        for course_data in coursesDict
                        if course_data["course_id"] == course["course_id"]
                    )
                ),
                "score": course["mmr_score"],
                "skills": [
                    skill["skill_name"]
                    for skill in data_fetcher.get_course_skills(course["course_id"])
                ],
                "coincident_skills": [
                    skill["skill_name"]
                    for skill in data_fetcher.get_course_skills(course["course_id"])
                    if skill["skill_id"] in user_skill_ids
                ],
            }
            for course in recommendations
        ]

        return jsonify(
            {
                "user_id": user_id,
                "user_skills": [
                    skill["skill_name"]
                    for skill in skills
                    if skill["skill_id"] in user_vector  # Show all aggregated skills
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
    print("\n\n=== API READY ===")
    print(f"Access at: {URL}")
    print("Press CTRL+C to stop\n")
    app.run(host=HOST, port=PORT, debug=True)
