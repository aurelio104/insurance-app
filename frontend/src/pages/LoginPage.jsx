import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/axios";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import "../stylespages.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Limpiar tokens previos al cargar la página
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  }, []);

  // Validar formulario
  const validateForm = () => {
    const errors = {};
    if (!email.trim()) errors.email = "El correo electrónico es obligatorio";
    if (!/\S+@\S+\.\S+/.test(email)) errors.email = "El correo electrónico no es válido";
    if (!password.trim()) errors.password = "La contraseña es obligatoria";
    return errors;
  };

  // Manejar inicio de sesión
  const handleLogin = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const { data } = await api.post("/auth/login", { email, password });

      // Guardar tokens y autenticar
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      login(data.token);

      navigate("/policies"); // Redirigir a políticas
    } catch (error) {
      const status = error.response?.status;
      setErrorMessage(
        status === 404
          ? "Usuario no registrado. Por favor, regístrate primero."
          : status === 401
          ? "Correo o contraseña incorrectos"
          : "Error al iniciar sesión. Por favor, intenta más tarde."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Bienvenido</h1>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <form onSubmit={handleLogin}>
          <div className="input-field">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={formErrors.email ? "input-error" : ""}
              autoComplete="email"
              aria-label="Correo electrónico"
            />
            {formErrors.email && <p className="error-message">{formErrors.email}</p>}
          </div>
          <div className="input-field">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={formErrors.password ? "input-error" : ""}
              autoComplete="current-password"
              aria-label="Contraseña"
            />
            {formErrors.password && <p className="error-message">{formErrors.password}</p>}
          </div>
          <button className="quote-button"              type="submit" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Iniciar Sesión"}
          </button>
        </form>
        <p className="quote-button"              type="submit"onClick={() => navigate("/forgot-password")}>Recuperar contraseña</p>
        <p className="quote-button"              type="submit"onClick={() => navigate("/register")}>Registrarse</p>
      </div>
    </div>
  );
};

export default LoginPage;
