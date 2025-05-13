import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import normalize
from typing import List, Dict
from sklearn.feature_extraction.text import TfidfTransformer


class PositionsRecommender:
    def __init__(self):
        self.skill_matrix = None
        self.position_sim_matrix = None
        self.position_ids = []
        self.skills_ids = []

    def train(self, positions: List[Dict]):
        """Build skill matrix for all positions"""
        self.skills_ids = list(
            {
                skill["skill_id"]
                for position in positions
                for skill in position["skills"]
            }
        )

        self.position_ids = [position["id"] for position in positions]

        self.skill_matrix = np.zeros((len(positions), len(self.skills_ids)))
        skill_index = {skill_id: idx for idx, skill_id in enumerate(self.skills_ids)}
        for idx, position in enumerate(positions):
            for skill in position["skills"]:
                skill_id = skill["skill_id"]
                if skill_id in skill_index:
                    self.skill_matrix[idx, skill_index[skill_id]] = 1

        transformer = TfidfTransformer(norm="l2", use_idf=True)
        self.skill_matrix = transformer.fit_transform(self.skill_matrix).toarray()
        self.position_sim_matrix = cosine_similarity(self.skill_matrix)

    def recommend(
        self,
        user_vector: np.ndarray,
        exclude_position_ids: List[int],
        top_n: int = 100,
        diversity_lambda: float = 0.5,
    ) -> List[Dict]:
        """Get top position recommendations using MMR diversification"""
        if self.skill_matrix is None:
            raise ValueError("Model not trained. Call train() first.")

        similarities = cosine_similarity([user_vector], self.skill_matrix)[0]

        candidate_indices = [
            idx
            for idx, position_id in enumerate(self.position_ids)
            if position_id not in exclude_position_ids
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
                    max_sim = np.max(self.position_sim_matrix[idx, selected_indices])
                    mmr = (diversity_lambda * current_sim) - (
                        (1 - diversity_lambda) * max_sim
                    )

                if mmr > best_mmr:
                    best_mmr = mmr
                    best_idx = idx

            if best_idx is None:
                break

            position_id = self.position_ids[best_idx]
            recommendations.append(
                {
                    "position_id": position_id,
                    "similarity_score": float(similarities[best_idx]),
                    "mmr_score": float(best_mmr),
                }
            )

            selected_indices.append(best_idx)
            candidate_indices.remove(best_idx)

        return recommendations
