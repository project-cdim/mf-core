# Copyright 2025 NEC Corporation.
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

FROM registry.access.redhat.com/ubi9/nodejs-22-minimal:latest

ARG USERNAME
ARG USER_UID
ARG USER_GID

# Install required packages and add user
USER root
RUN microdnf update -y && \
    microdnf install -y git tar shadow-utils sudo && \
    microdnf clean all && \
    groupadd --gid $USER_GID $USERNAME && \
    useradd --uid $USER_UID --gid $USER_GID -m $USERNAME && \
    echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME && \
    chmod 0440 /etc/sudoers.d/$USERNAME

# Set application directory
WORKDIR /opt/app-root/src/workspace
COPY package*.json ./

# Install node.js packages
RUN npm install

# Change owner
RUN chown -R $USERNAME:$USERNAME /opt/app-root/src/

# Switch user
USER $USERNAME

# Start application
CMD ["npm", "run", "dev"]
