#!/bin/bash

set -e

BACKEND_DIR="./backend"
FRONTEND_DIR="./frontend"

echo "🔧 Iniciando backend..."

cd "$BACKEND_DIR"

echo "📦 Instalando dependências do backend..."
npm install

echo "🐳 Subindo containers com Docker Compose..."
docker-compose up -d

echo "🚀 Iniciando servidor backend..."
npm start &

cd -

echo "🎨 Iniciando frontend..."

cd "$FRONTEND_DIR"

echo "📦 Instalando dependências do frontend..."
npm install

echo "🚀 Iniciando servidor frontend (Angular)..."
npm start

