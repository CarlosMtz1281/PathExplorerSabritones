from typing import Dict, List
import numpy as np
from sklearn.preprocessing import normalize
from data_fetcher import DataFetcher


class RecommenderFeaturizer:
    def __init__(self, data_fetcher: DataFetcher):
        self.skill_weights = {
            "current_skills": 0.5,
            "goal_skills": 2.0,
            "position_skills": 1.0,
            "certificate_skills": 0.7,
        }
        self.priority_bonus = {
            "High": 2.0,
            "Medium": 1.5,
            "Low": 1.0,
        }
        self.repetition_bonus = 0.15
        self.data_fetcher = data_fetcher
        self.skill_name_to_id = self._load_skill_mappings()

    def _load_skill_mappings(self) -> Dict[str, int]:
        """Load skill mappings from the API"""
        skills = self.data_fetcher.get_all_skills()
        skill_name_to_id = {}
        for skill in skills:
            name = skill.get("skill_name", "").lower()
            skill_id = skill.get("skill_id")
            if skill_id:
                skill_name_to_id[name] = skill_id
        return skill_name_to_id

    def _extract_skills_from_text(self, text: str) -> List[int]:
        tokens = text.lower().split()
        found_skills = set()
        # Check single words and n-grams (e.g., "java development")
        for n in [1, 2, 3]:  # Check 1, 2, and 3-word phrases
            for i in range(len(tokens) - n + 1):
                phrase = " ".join(tokens[i : i + n])
                if phrase in self.skill_name_to_id:
                    found_skills.add(self.skill_name_to_id[phrase])
        return list(found_skills)

    def create_user_vector(self, user_data: Dict, all_skills: List[int]) -> np.ndarray:
        """Create weighted skill vector for user"""
        skill_vector = np.zeros(len(all_skills))
        skill_index = {skill_id: idx for idx, skill_id in enumerate(all_skills)}

        def extract_skill_ids(items):
            if not items:
                return []

            # Case: list of dicts with "skill_id"
            if isinstance(items[0], dict) and "skill_id" in items[0]:
                return [item["skill_id"] for item in items]

            # Case: list of numbers (int or str) — ensure conversion to int
            try:
                return [int(item) for item in items]
            except (TypeError, ValueError):
                return []

        # Handle current skills
        skills_data = user_data.get("skills", {})
        current_skills = (
            skills_data.get("skills_id", [])
            if isinstance(skills_data, dict)
            else extract_skill_ids(skills_data)
        )
        self._add_skills(
            skill_vector,
            skill_index,
            current_skills,
            self.skill_weights["current_skills"],
        )

        # Goal skills: only add if nested "skills" are provided
        goal_skills = []
        if isinstance(user_data.get("goals"), list):
            for goal in user_data.get("goals", []):
                desc_skills = self._extract_skills_from_text(goal.get("goal_desc", ""))
                goal_skills.extend(desc_skills)
                priority = goal.get("priority", goal.get("goal_priority", "Low"))
                multiplier = self.priority_bonus.get(priority, 1.0)
                adjusted_weight = self.skill_weights["goal_skills"] * multiplier

                self._add_skills(
                    skill_vector,
                    skill_index,
                    goal_skills,
                    adjusted_weight,
                )

        # Positions
        if isinstance(user_data.get("positions"), dict):
            position_data = user_data.get("positions", {})
            position_skills = (
                position_data.get("skills_id", [])
                if isinstance(position_data, dict)
                else []
            )
            if not position_skills:
                for position in position_data:  # if it's a list
                    position_skills.extend(
                        extract_skill_ids(position.get("skills", []))
                    )
            self._add_skills(
                skill_vector,
                skill_index,
                position_skills,
                self.skill_weights["position_skills"],
            )

        # Certificates
        if isinstance(user_data.get("certificates"), dict):
            cert_data = user_data.get("certificates", {})
            cert_skills = (
                cert_data.get("skills_id", []) if isinstance(cert_data, dict) else []
            )
            if not cert_skills:
                for cert in cert_data:
                    cert_skills.extend(cert.get("skills_id", []))
            self._add_skills(
                skill_vector,
                skill_index,
                cert_skills,
                self.skill_weights["certificate_skills"],
            )

        if np.any(skill_vector):
            return normalize([skill_vector])[0]

        return skill_vector

    def _count_skills(self, skills: List[int]) -> Dict[int, int]:
        """Count occurrences of each skill ID"""
        skill_counts = {}
        for skill_id in skills:
            if skill_id in skill_counts:
                skill_counts[skill_id] += 1
            else:
                skill_counts[skill_id] = 1
        return skill_counts

    def _add_skills(
        self,
        vector: np.ndarray,
        skill_index: Dict,
        skills: List[int],
        base_weight: float,
    ):
        """Helper method to add skills to vector"""
        skill_counts = self._count_skills(skills)
        for skill_id, count in skill_counts.items():
            total_weight = base_weight + (self.repetition_bonus * (count - 1))
            if skill_id in skill_index:
                vector[skill_index[skill_id]] += total_weight
