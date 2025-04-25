#!/bin/bash
tmux list-panes -F '#{pane_id}' | while read pane; do tmux send-keys -t "$pane" C-c; done
tmux list-panes -F '#{pane_id}' | while read pane; do tmux send-keys -t "$pane" C-l; done