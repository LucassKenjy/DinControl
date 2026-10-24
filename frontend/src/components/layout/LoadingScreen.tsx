import styles from './LoadingScreen.module.css'

/** Tela de carregamento exibida enquanto a sessão ou os dados iniciais chegam. */
export function LoadingScreen() {
  return (
    <div id="loading-screen" className={styles['loading-screen']} role="status">
      <img src="/assets/Logo.png" alt="DinControl" className={styles.logo} />
      <div className={styles.loader}></div>
      <span className="sr-only">Carregando...</span>
    </div>
  )
}
