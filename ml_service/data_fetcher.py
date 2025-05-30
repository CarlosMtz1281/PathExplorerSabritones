import requests
import os
from dotenv import load_dotenv
from typing import Dict, List

load_dotenv()


class DataFetcher:
    def __init__(self, api_base: str):
        self.base_url = api_base
        self.headers = {
            "admin-password": os.getenv("ADMIN_PASSWORD_ML"),
        }

    def get_user_data(self, user_id: int) -> Dict:
        """Fetch all relevant user data from Express API"""
        endpoints = ["skills", "certificates", "positions", "goals"]

        data = {}
        for endpoint in endpoints:
            response = requests.get(
                f"{self.base_url}/ml-user-data/{endpoint}/{user_id}",
                headers=self.headers,
            )
            if response.status_code == 200:
                data[endpoint] = response.json()

        return data

    def get_all_certificates(self) -> List[Dict]:
        """Fetch all available certificates"""
        response = requests.get(
            f"{self.base_url}/general/certificates", headers=self.headers
        )
        return response.json() if response.status_code == 200 else []

    def get_certificate_skills(self, certificate_id: int) -> List[int]:
        """Get skills associated with a certificate"""
        response = requests.get(
            f"{self.base_url}/general/certificates/{certificate_id}/skills",
            headers=self.headers,
        )
        return response.json() if response.status_code == 200 else []

    def get_all_skills(self) -> List[Dict]:
        """Fetch all skills with names and IDs"""
        response = requests.get(f"{self.base_url}/general/skills", headers=self.headers)
        return response.json() if response.status_code == 200 else []

    def get_all_positions(self) -> List[Dict]:
        """Fetch all available positions"""
        response = requests.get(
            f"{self.base_url}/ml-user-data/all_positions", headers=self.headers
        )
        return response.json() if response.status_code == 200 else []

    def get_position_skills(self, position_id: int) -> List[int]:
        """Get skills associated with a position"""
        response = requests.get(
            f"{self.base_url}/ml-user-data/position/{position_id}",
            headers=self.headers,
        )
        return response.json() if response.status_code == 200 else []
