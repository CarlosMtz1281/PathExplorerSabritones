import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import normalize
from typing import List, Dict
from sklearn.feature_extraction.text import TfidfTransformer


class CertificateRecommender:
    def __init__(self):
        self.skill_matrix = None
        self.cert_sim_matrix = None
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

        transformer = TfidfTransformer(norm="l2", use_idf=True)
        self.skill_matrix = transformer.fit_transform(self.skill_matrix).toarray()
        # Compute certificate similarity matrix
        self.cert_sim_matrix = cosine_similarity(self.skill_matrix)

    def recommend(
        self,
        user_vector: np.ndarray,
        exclude_cert_ids: List[int],
        existing_providers: List[int] = None,
        provider_bonus: float = 0.125,
        top_n: int = 100,
        diversity_lambda: float = 0.5,
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

        candidate_indices = [
            idx
            for idx, cert_id in enumerate(self.certificate_ids)
            if cert_id not in exclude_cert_ids
        ]
        recommendations = []
        selected_indices = []

        while len(recommendations) < top_n and candidate_indices:
            best_mmr = -np.inf
            best_idx = None
            for idx in candidate_indices:
                current_sim = similarities[idx]
                if not selected_indices:
                    mmr = diversity_lambda * current_sim
                else:
                    max_sim = np.max(self.cert_sim_matrix[idx, selected_indices])
                    mmr = (diversity_lambda * current_sim) - (
                        (1 - diversity_lambda) * max_sim
                    )
                if mmr > best_mmr:
                    best_mmr = mmr
                    best_idx = idx
            if best_idx is None:
                break
            cert_id = self.certificate_ids[best_idx]
            recommendations.append(
                {
                    "certificate_id": cert_id,
                    "similarity_score": float(similarities[best_idx]),
                    "mmr_score": float(best_mmr),
                }
            )
            selected_indices.append(best_idx)
            candidate_indices.remove(best_idx)

        return recommendations
