#!/bin/bash
cd "$(dirname "$0")"
echo "========================================"
echo "   ACTUALIZADOR DE REPERTORIO GOSPEL"
echo "========================================"
echo ""
echo "Ejecutando script de construcción..."
python3 tools/build.py
echo ""
echo "========================================"
echo "¡Listo! El sitio web ha sido actualizado."
echo "========================================"
read -p "Presiona Enter para cerrar esta ventana..."
