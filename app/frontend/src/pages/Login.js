import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button,
  Typography, Alert, CircularProgress, InputAdornment
} from '@mui/material';
import { Email, Lock, Security } from '@mui/icons-material';
import axios from 'axios';

const Login = () => {
  // État de l'étape (1 = login, 2 = OTP)
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ===== ÉTAPE 1 : Envoyer email + password =====
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        '/student/api/auth/login',
        { email, password }
      );

      if (response.data.success) {
        setSuccess(response.data.message);
        setStep(2); // Passer à l'étape OTP
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // ===== ÉTAPE 2 : Vérifier OTP =====
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        '/student/api/auth/verify-otp',
        { email, otp }
      );

      if (response.data.success) {
        // Sauvegarder le token JWT
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('email', email);
        // Rediriger vers le dashboard
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Code OTP invalide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1f497d 0%, #4682b4 100%)'
    }}>
      <Card sx={{ width: 420, borderRadius: 3, boxShadow: 10 }}>
        <CardContent sx={{ p: 4 }}>

          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Security sx={{ fontSize: 60, color: '#1f497d' }} />
            <Typography variant="h4" fontWeight="bold" color="#1f497d">
              StudentOps
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {step === 1
                ? 'Connectez-vous à votre compte'
                : 'Vérification en deux étapes'}
            </Typography>
          </Box>

          {/* Indicateur d'étape */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 3,
            gap: 1
          }}>
            <Box sx={{
              width: 40, height: 6, borderRadius: 3,
              bgcolor: step >= 1 ? '#1f497d' : '#ddd'
            }} />
            <Box sx={{
              width: 40, height: 6, borderRadius: 3,
              bgcolor: step >= 2 ? '#1f497d' : '#ddd'
            }} />
          </Box>

          {/* Alertes */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
          )}

          {/* ===== FORMULAIRE ÉTAPE 1 ===== */}
          {step === 1 && (
            <form onSubmit={handleLogin}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Étape 1 — Identifiants
              </Typography>

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                fullWidth
                label="Mot de passe"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  )
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  bgcolor: '#1f497d',
                  py: 1.5,
                  fontSize: '1rem'
                }}
              >
                {loading
                  ? <CircularProgress size={24} color="inherit" />
                  : 'Continuer →'}
              </Button>
            </form>
          )}

          {/* ===== FORMULAIRE ÉTAPE 2 (OTP) ===== */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Étape 2 — Code de vérification
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Un code à 6 chiffres a été envoyé sur :
                <strong> {email}</strong>
              </Typography>

              <TextField
                fullWidth
                label="Code OTP (6 chiffres)"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                inputProps={{
                  maxLength: 6,
                  style: {
                    textAlign: 'center',
                    fontSize: '2rem',
                    letterSpacing: '0.5rem'
                  }
                }}
                sx={{ mb: 3 }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  bgcolor: '#1f497d',
                  py: 1.5,
                  fontSize: '1rem',
                  mb: 2
                }}
              >
                {loading
                  ? <CircularProgress size={24} color="inherit" />
                  : '✅ Vérifier et accéder'}
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={() => {
                  setStep(1);
                  setOtp('');
                  setError('');
                  setSuccess('');
                }}
              >
                ← Retour
              </Button>
            </form>
          )}

        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
