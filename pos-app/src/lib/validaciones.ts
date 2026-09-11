// Reglas de validación de la US_01.
// Están en un archivo aparte para poder usarlas en el formulario (cliente)
// y en la API (servidor) sin repetir código.

// Solo estos cuentan como carácter especial (definido en las observaciones de la historia).
const CARACTERES_ESPECIALES = ["#", "*", "$", "_", "-", "%"];

export function validarCorreo(correo: string): string | null {
  const formato = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!correo.trim()) return "El correo es obligatorio.";
  if (!formato.test(correo)) return "El correo no tiene un formato válido.";
  return null;
}

export function validarNombre(nombre: string): string | null {
  if (nombre.trim().length < 3) return "El nombre debe tener al menos 3 caracteres.";
  return null;
}

export function validarCedula(cedula: string): string | null {
  if (!/^[0-9]{6,12}$/.test(cedula)) {
    return "La cédula debe tener entre 6 y 12 dígitos, sin puntos ni espacios.";
  }
  return null;
}

export function validarContrasena(contrasena: string): string | null {
  if (contrasena.length < 8) {
    return "La contraseña debe tener al menos 8 caracteres.";
  }
  if (!/[A-ZÁÉÍÓÚÑ]/.test(contrasena)) {
    return "La contraseña debe tener al menos una letra mayúscula.";
  }
  if (!/[0-9]/.test(contrasena)) {
    return "La contraseña debe tener al menos un número.";
  }
  const tieneEspecial = contrasena
    .split("")
    .some((caracter) => CARACTERES_ESPECIALES.includes(caracter));
  if (!tieneEspecial) {
    return "La contraseña debe tener al menos un carácter especial: # * $ _ - %";
  }
  return null;
}