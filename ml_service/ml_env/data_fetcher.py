import requests
from typing import Dict, List


class DataFetcher:
    def __init__(self, api_base: str):
        self.base_url = api_base

    def get_user_data(self, user_id: int) -> Dict:
        """Fetch all relevant user data from Express API"""
        endpoints = ["skills", "certificates", "courses", "positions", "goals"]

        data = {}
        for endpoint in endpoints:
            response = requests.get(
                f"{self.base_url}/ml-user-data/{endpoint}/{user_id}"
            )
            if response.status_code == 200:
                data[endpoint] = response.json()

        return data

    def get_all_certificates(self) -> List[Dict]:
        """Fetch all available certificates"""
        response = requests.get(f"{self.base_url}/general/certificates")
        return response.json() if response.status_code == 200 else []

    def get_certificate_skills(self, certificate_id: int) -> List[int]:
        """Get skills associated with a certificate"""
        response = requests.get(
            f"{self.base_url}/general/certificates/{certificate_id}/skills"
        )
        return response.json() if response.status_code == 200 else []

    def get_all_skills(self) -> List[Dict]:
        """Fetch all skills with names and IDs"""
        response = requests.get(f"{self.base_url}/general/skills")
        return response.json() if response.status_code == 200 else []
