#!/usr/bin/env bash
# Forward a running ECS task's Node inspector (9229) to localhost.
# Requires: aws cli v2, session-manager-plugin, ECS Exec enabled on the service.
set -euo pipefail

CLUSTER="${CLUSTER:-stepfn-express}"
SERVICE="${1:?usage: $0 <catalog|inventory|pricing|orders|notify> [localPort]}"
LOCAL_PORT="${2:-9221}"

TASK_ARN="$(aws ecs list-tasks --cluster "$CLUSTER" --service-name "$SERVICE" --desired-status RUNNING --query 'taskArns[0]' --output text)"
if [[ -z "$TASK_ARN" || "$TASK_ARN" == "None" ]]; then
  echo "no running task for $SERVICE in $CLUSTER" >&2
  exit 1
fi

RUNTIME_ID="$(aws ecs describe-tasks --cluster "$CLUSTER" --tasks "$TASK_ARN" \
  --query 'tasks[0].containers[?name==`api`].runtimeId | [0]' --output text)"

echo "forwarding $SERVICE inspector to localhost:${LOCAL_PORT} (task $TASK_ARN)"
aws ssm start-session \
  --target "ecs:${CLUSTER}_${TASK_ARN##*/}_${RUNTIME_ID}" \
  --document-name AWS-StartPortForwardingSession \
  --parameters "{\"portNumber\":[\"9229\"],\"localPortNumber\":[\"${LOCAL_PORT}\"]}"
