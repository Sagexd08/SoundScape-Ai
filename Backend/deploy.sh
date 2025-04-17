#!/bin/bash

# SoundScape-AI Backend Deployment Script

echo -e "\e[32mStarting SoundScape-AI Backend Deployment...\e[0m"

echo -e "\e[36mBuilding Docker containers...\e[0m"
docker-compose build
if [ $? -ne 0 ]; then
    echo -e "\e[31mError building Docker containers. Exiting.\e[0m"
    exit 1
fi

echo -e "\e[36mStarting Docker containers...\e[0m"
docker-compose up -d
if [ $? -ne 0 ]; then
    echo -e "\e[31mError starting Docker containers. Exiting.\e[0m"
    exit 1
fi

# Check if containers are running
echo -e "\e[36mChecking container status...\e[0m"
docker-compose ps

echo -e "\e[32mSoundScape-AI Backend deployment completed successfully!\e[0m"
echo -e "\e[33mAPI Gateway is accessible at: http://localhost:8000\e[0m"
echo -e "\e[33mAPI Documentation is available at: http://localhost:8000/api/docs\e[0m"
