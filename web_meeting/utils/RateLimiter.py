from collections import defaultdict, deque
from .Debugger import Debugger
import time

class RateLimiter:
    __meeting_user_count = defaultdict(int) # A dictionary to track the number of users in each meeting currently --> {meeting_id: user_count}

    def __init__(self, max_users_per_meeting: int, rate_limit_time_window: int):
        self.max_users_per_meeting = max_users_per_meeting # The maximum number of users allowed to join a meeting at once
        self.rate_limit_time_window = rate_limit_time_window # The time frame within which the rate limiting is applied for chat requests (seconds)

    def updateMeetingCount(self, meeting_id: str, action: str) -> None:
        """
        Function to update in-memory data structure on head counts in meetings
        """
        if action == "join":
            self.__meeting_user_count[meeting_id] += 1
            Debugger.log_message(Debugger.DEBUG, f"Meeting count: {self.__meeting_user_count[meeting_id]}")
        elif action == "leave":
            self.__meeting_user_count[meeting_id] -= 1
            Debugger.log_message(Debugger.DEBUG, f"Meeting count: {self.__meeting_user_count[meeting_id]}")
        else:
            raise ValueError(f"Invalid action: {action}. Expected 'join' or 'leave'.")