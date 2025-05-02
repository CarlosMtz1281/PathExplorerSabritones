import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import normalize
from typing import List, Dict


class CertificateRecommender:
    def __init__(self):
        self.skill_matrix = None
        self.certificate_ids = []
        self.skill_ids = []
        self.certificate_providers = {}

    def train(self, certificates: List[Dict]):
        """Build skill matrix for all certificates"""
        self.skill_ids = list(
            {skill["skill_id"] for cert in certificates for skill in cert["skills"]}
        )

        self.certificate_ids = [cert["id"] for cert in certificates]
        self.certificate_providers = {
            cert["id"]: cert.get("provider") for cert in certificates
        }

        self.skill_matrix = np.zeros((len(certificates), len(self.skill_ids)))
        skill_index = {skill_id: idx for idx, skill_id in enumerate(self.skill_ids)}
        for idx, cert in enumerate(certificates):
            for skill in cert["skills"]:
                skill_id = skill["skill_id"]
                if skill_id in skill_index:
                    self.skill_matrix[idx, skill_index[skill_id]] = 1

        # Normalize matrix
        self.skill_matrix = normalize(self.skill_matrix)

    def recommend(
        self,
        user_vector: np.ndarray,
        exclude_cert_ids: List[int],
        existing_providers: List[int] = None,
        provider_bonus: float = 0.025,
        top_n: int = 100,
    ) -> List[Dict]:
        """Get top certificate recommendations"""
        if self.skill_matrix is None:
            raise ValueError("Model not trained. Call train() first.")

        # Calculate similarities
        similarities = cosine_similarity([user_vector], self.skill_matrix)[0]

        if existing_providers:
            for idx in range(len(similarities)):
                cert_id = self.certificate_ids[idx]
                cert_provider = self.certificate_providers.get(cert_id)
                if cert_provider and cert_provider in existing_providers:
                    similarities[idx] += provider_bonus

        # Sort certificates by similarity
        sorted_indices = np.argsort(similarities)[::-1]

        recommendations = []
        for idx in sorted_indices:
            cert_id = self.certificate_ids[idx]
            if cert_id not in exclude_cert_ids:
                recommendations.append(
                    {
                        "certificate_id": cert_id,
                        "similarity_score": float(similarities[idx]),
                    }
                )
            if len(recommendations) >= top_n:
                break

        return recommendations
