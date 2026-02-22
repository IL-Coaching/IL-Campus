# MÓDULO DE EXTENSIÓN: PYTHON
# Stack: Python 3.11+, tipado estático, entornos virtuales, seguridad específica
# Se usa junto al Prompt Maestro ArchSecure AI cuando el proyecto es Python

---

## CONTEXTO DE MÓDULO

El Prompt Maestro usa TypeScript como referencia. Este módulo traduce todos sus
principios al ecosistema Python: convenciones, estructura, herramientas de calidad
y patrones de seguridad propios del lenguaje.

---

## ARQUITECTURA ESTÁNDAR EN PYTHON

```
/
├── README.md
├── pyproject.toml             # Reemplaza package.json — dependencias y configuración
├── .env.example
├── .gitignore                 # Incluye: .env, __pycache__, .venv, *.pyc
│
├── /config
│   ├── __init__.py
│   ├── configuracion.py       # Settings centralizados con pydantic-settings
│   └── README.md
│
├── /docs
│   ├── arquitectura.md
│   ├── onboarding.md
│   └── seguridad.md
│
├── /src
│   ├── /nucleo
│   │   └── /[modulo]
│   │       ├── __init__.py
│   │       ├── modelos.py     # Dataclasses o Pydantic models
│   │       ├── servicios.py
│   │       ├── validadores.py
│   │       └── tipos.py       # TypeAlias, TypedDict, Protocol
│   │
│   ├── /compartido
│   │   ├── /utilidades
│   │   ├── /constantes
│   │   └── /excepciones       # Excepciones personalizadas del dominio
│   │
│   ├── /api                   # Si aplica (FastAPI / Flask)
│   │   ├── /rutas
│   │   ├── /middlewares
│   │   └── servidor.py
│   │
│   └── principal.py           # Punto de entrada
│
├── /tests
│   ├── conftest.py
│   ├── /unitarios
│   ├── /integracion
│   └── /seguridad
│
└── /scripts
    └── README.md
```

---

## ENTORNO Y DEPENDENCIAS

### Configuración inicial obligatoria

```bash
# Crear entorno virtual (SIEMPRE, nunca instalar globalmente)
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows

# Instalar dependencias
pip install -e ".[dev]"
```

### `pyproject.toml` — Estructura base

```toml
[project]
name = "nombre-proyecto"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "pydantic>=2.0",
    "pydantic-settings>=2.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0",
    "pytest-cov",
    "mypy>=1.0",
    "ruff>=0.1",        # linter + formatter (reemplaza flake8 + black + isort)
    "bandit>=1.7",      # análisis de seguridad estático
]

[tool.ruff]
line-length = 88
select = ["E", "F", "I", "N", "S", "UP"]  # S = reglas de seguridad

[tool.mypy]
strict = true
python_version = "3.11"

[tool.pytest.ini_options]
testpaths = ["tests"]
```

---

## CONVENCIONES PYTHON

### Nomenclatura (PEP 8 estricto)

```python
# Variables y funciones: snake_case
nombre_usuario = "Juan"
def obtener_usuario(usuario_id: int) -> Usuario: ...

# Clases: PascalCase
class ServicioUsuario: ...

# Constantes: UPPER_SNAKE_CASE
MAX_REINTENTOS = 3
URL_BASE_API = "https://api.ejemplo.com"

# Archivos: snake_case
# servicio_usuario.py, validador_pago.py, tipos_comunes.py
```

### Tipado Estático Obligatorio

```python
# ❌ MAL — sin tipos, difícil de mantener y auditar
def procesar_pago(monto, usuario, metodo):
    ...

# ✅ BIEN — tipado completo
from decimal import Decimal
from typing import Literal

def procesar_pago(
    monto: Decimal,
    usuario: Usuario,
    metodo: Literal["tarjeta", "transferencia"]
) -> ResultadoPago:
    ...
```

### Modelos con Pydantic v2

```python
from pydantic import BaseModel, EmailStr, field_validator
from decimal import Decimal

class CrearUsuarioDTO(BaseModel):
    """Datos de entrada para crear un usuario. Valida y sanitiza automáticamente."""
    nombre: str
    email: EmailStr
    edad: int

    @field_validator('nombre')
    @classmethod
    def nombre_no_vacio(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('El nombre no puede estar vacío')
        return v

    @field_validator('edad')
    @classmethod
    def edad_valida(cls, v: int) -> int:
        if not (0 < v < 150):
            raise ValueError('Edad fuera de rango válido')
        return v
```

### Configuración Centralizada con pydantic-settings

```python
# config/configuracion.py
from pydantic_settings import BaseSettings

class Configuracion(BaseSettings):
    """
    Configuración centralizada del proyecto.
    Lee automáticamente desde variables de entorno o archivo .env
    """
    database_url: str
    api_key: str
    debug: bool = False
    nivel_log: str = "INFO"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

# Instancia única (singleton)
configuracion = Configuracion()
```

---

## SEGURIDAD ESPECÍFICA DE PYTHON

### Análisis Estático de Seguridad con Bandit

```bash
# Ejecutar en CI/CD y pre-commit
bandit -r src/ -ll  # -ll: reporta issues de nivel MEDIUM y HIGH
```

Bandit detecta automáticamente: uso de `eval()`, `exec()`, `subprocess` sin sanitizar, uso de `pickle` inseguro, passwords hardcodeados, uso de MD5/SHA1 para hashing de contraseñas, y más.

### Vulnerabilidades Comunes en Python

```python
# ❌ Deserialización insegura — NUNCA deserializar pickle de fuentes externas
import pickle
datos = pickle.loads(request.body)  # RCE garantizado

# ✅ Usar JSON o Pydantic para datos externos
import json
from pydantic import BaseModel
datos = MiModelo.model_validate_json(request.body)

# ❌ Inyección en subprocess
import subprocess
subprocess.run(f"ls {directorio_usuario}", shell=True)  # Command Injection

# ✅ Lista de argumentos, nunca shell=True con datos externos
subprocess.run(["ls", directorio_usuario], shell=False, check=True)

# ❌ Eval con datos externos
resultado = eval(expresion_usuario)  # RCE

# ✅ Nunca usar eval con datos no confiables — buscar alternativa
```

### Hashing Seguro de Contraseñas

```python
# ❌ MAL
import hashlib
hash_password = hashlib.md5(password.encode()).hexdigest()

# ✅ BIEN — bcrypt o argon2
from passlib.context import CryptContext
contexto_cripto = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hashear_password(password: str) -> str:
    return contexto_cripto.hash(password)

def verificar_password(password: str, hash: str) -> bool:
    return contexto_cripto.verify(password, hash)
```

---

## HERRAMIENTAS DE CALIDAD (Pre-commit)

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.0
    hooks:
      - id: ruff           # lint
      - id: ruff-format    # format

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.0.0
    hooks:
      - id: mypy

  - repo: https://github.com/PyCQA/bandit
    rev: 1.7.5
    hooks:
      - id: bandit
        args: ["-ll", "-r", "src/"]
```

---

## CHECKLIST ESPECÍFICO DE PYTHON

- [ ] Entorno virtual en `.venv` (nunca instalación global)
- [ ] `pyproject.toml` como fuente única de configuración de dependencias
- [ ] Tipado estático completo con mypy en modo strict
- [ ] Modelos de entrada con Pydantic v2 (validación automática)
- [ ] Configuración centralizada con pydantic-settings (nunca leer `os.environ` directo)
- [ ] Bandit configurado en pre-commit y CI/CD
- [ ] Ruff configurado (lint + format, reemplaza flake8 + black + isort)
- [ ] Sin uso de `eval()`, `exec()`, ni `pickle` con datos externos
- [ ] Sin `shell=True` en subprocess con datos no confiables
- [ ] Hashing de contraseñas con bcrypt o argon2 (nunca MD5/SHA1)
- [ ] Excepciones personalizadas para errores del dominio
