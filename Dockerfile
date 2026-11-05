# Copyright 2025-2026 NEC Corporation.
#
# Licensed under the Apache License, Version 2.0 (the "License"); you may
# not use this file except in compliance with the License. You may obtain
# a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.

FROM registry.access.redhat.com/ubi9/nodejs-22-minimal:1-1776863671@sha256:670c207e6872898228015fa8ec2e4165cfa13089a9e5fccb4f9c6d6cda2811ba

ARG USERNAME
ARG USER_UID
ARG USER_GID

# Install required packages and add user
USER root
# Note: Pinning is avoided to prevent build errors and maintain reproducibility.
# hadolint ignore=DL3041
RUN microdnf install -y git sudo && \
    microdnf clean all && \
    groupadd --gid $USER_GID $USERNAME && \
    useradd --uid $USER_UID --gid $USER_GID -m $USERNAME && \
    echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME && \
    chmod 0440 /etc/sudoers.d/$USERNAME

# Set application directory
WORKDIR /opt/app-root/src/workspace
COPY package*.json ./

# Install node.js packages and set ownership
RUN npm install \
    && npm cache clean --force \
    && chown -R $USERNAME:$USERNAME /opt/app-root/src/

# Switch user
USER $USERNAME

# Start application
CMD ["npm", "run", "dev"]