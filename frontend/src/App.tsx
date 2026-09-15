import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { LoginPage } from './pages/Login/LoginPage'
import { CadastroPage } from './pages/Cadastro/CadastroPage'
import { RedefinirPage } from './pages/Redefinir/RedefinirPage'
import { RedefinirSenhaPage } from './pages/RedefinirSenha/RedefinirSenhaPage'
import { PrincipalPage } from './pages/Principal/PrincipalPage'
import { HistoricoPage } from './pages/Historico/HistoricoPage'
import { PerfilPage } from './pages/Perfil/PerfilPage'
import { AnotacoesPage } from './pages/Anotacoes/AnotacoesPage'
import { ListaPage } from './pages/Anotacoes/ListaPage'
import { NotaPage } from './pages/Anotacoes/NotaPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />
          <Route path="/redefinir" element={<RedefinirPage />} />
          <Route path="/redefinir-senha" element={<RedefinirSenhaPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/principal" element={<PrincipalPage />} />
            <Route path="/historico" element={<HistoricoPage />} />
            <Route path="/perfil" element={<PerfilPage />} />
            <Route path="/anotacoes" element={<AnotacoesPage />} />
            <Route path="/anotacoes/:id" element={<NotaPage />} />
            <Route path="/listas" element={<Navigate to="/anotacoes" replace />} />
            <Route path="/listas/:id" element={<ListaPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
