import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const getAuthErrorMessage = (error) => {
  if (!error) {
    return "";
  }

  if (error.message === "Invalid login credentials") {
    return "Nieprawidłowy email albo hasło.";
  }

  return error.message || "Nie udało się wykonać akcji konta.";
};

const AuthPanel = () => {
  const {
    isConfigured,
    isLoading,
    user,
    signInWithPassword,
    signUpWithPassword,
    signOut,
  } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitAuthForm = async (event) => {
    event.preventDefault();

    setStatusMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    const authAction =
      mode === "sign-up" ? signUpWithPassword : signInWithPassword;
    const { error } = await authAction({
      email: email.trim(),
      password,
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(getAuthErrorMessage(error));
      return;
    }

    setPassword("");
    setStatusMessage(
      mode === "sign-up"
        ? "Konto utworzone. Sprawdź email, jeśli Supabase wymaga potwierdzenia."
        : "Zalogowano."
    );
  };

  const handleSignOut = async () => {
    setStatusMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    const { error } = await signOut();

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(getAuthErrorMessage(error));
      return;
    }

    setStatusMessage("Wylogowano.");
  };

  return (
    <div className="auth-panel">
      <button
        type="button"
        className="auth-panel-toggle"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((currentState) => !currentState)}
      >
        <span aria-hidden="true">{user ? "✅" : "👤"}</span>
        <span>{user ? "Konto" : "Zaloguj"}</span>
      </button>

      {isOpen && (
        <section className="auth-panel-popover" aria-label="Konto">
          <div className="auth-panel-header">
            <span>Konto</span>
            <button
              type="button"
              aria-label="Zamknij panel konta"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          {!isConfigured && (
            <p className="auth-panel-note">
              Supabase nie jest jeszcze skonfigurowany. Uzupełnij `.env.local`
              na podstawie `.env.example`, a panel logowania zacznie działać.
            </p>
          )}

          {isConfigured && isLoading && (
            <p className="auth-panel-note">Sprawdzam sesję...</p>
          )}

          {isConfigured && !isLoading && user && (
            <div className="auth-panel-account">
              <span>Zalogowano jako</span>
              <strong>{user.email}</strong>
              <button
                type="button"
                className="auth-panel-submit"
                disabled={isSubmitting}
                onClick={handleSignOut}
              >
                {isSubmitting ? "Wylogowuję..." : "Wyloguj"}
              </button>
            </div>
          )}

          {isConfigured && !isLoading && !user && (
            <form className="auth-panel-form" onSubmit={submitAuthForm}>
              <div className="auth-panel-mode">
                <button
                  type="button"
                  className={mode === "sign-in" ? "active" : ""}
                  onClick={() => setMode("sign-in")}
                >
                  Logowanie
                </button>
                <button
                  type="button"
                  className={mode === "sign-up" ? "active" : ""}
                  onClick={() => setMode("sign-up")}
                >
                  Rejestracja
                </button>
              </div>

              <label>
                <span>Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>

              <label>
                <span>Hasło</span>
                <input
                  type="password"
                  autoComplete={
                    mode === "sign-up" ? "new-password" : "current-password"
                  }
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>

              <button
                type="submit"
                className="auth-panel-submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Przetwarzam..."
                  : mode === "sign-up"
                    ? "Utwórz konto"
                    : "Zaloguj"}
              </button>
            </form>
          )}

          {statusMessage && (
            <p className="auth-panel-status" role="status">
              {statusMessage}
            </p>
          )}
          {errorMessage && (
            <p className="auth-panel-error" role="alert">
              {errorMessage}
            </p>
          )}
        </section>
      )}
    </div>
  );
};

export default AuthPanel;
