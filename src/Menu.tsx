import { useNavigate } from "react-router-dom";

export default function Menu() {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Wybierz Formularz</h1>
            <div style={styles.menuGrid}>
                <button style={styles.btnSimracing} onClick={() => navigate("/simracing")}>
                    DIRT RALLY 2.0
                </button>
                <button style={styles.btnOvercooked} onClick={() => navigate("/overcooked")}>
                    OVERCOOKED
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: {
        textAlign: 'center' as const,
        padding: '50px 20px',
        fontFamily: 'Arial, sans-serif'
    },
    title: {
        fontSize: '2.5rem',
        color: '#333',
        marginBottom: '4px'
    },
    menuGrid: {
        display: 'flex',
        justifyContent: 'center',
        gap: '30px',
        marginTop: '40px',
        flexWrap: 'wrap' as const
    },
    btnSimracing: {
        backgroundColor: '#121212',
        color: '#fff',
        border: '3px solid #ff4f00',
        padding: '30px 40px',
        fontSize: '1.3rem',
        borderRadius: '12px',
        cursor: 'pointer',
        fontWeight: 'bold' as const,
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
    },
    btnOvercooked: {
        backgroundColor: '#fffcf2',
        color: '#252422',
        border: '4px solid #ffb703',
        padding: '30px 40px',
        fontSize: '1.3rem',
        borderRadius: '24px',
        cursor: 'pointer',
        fontWeight: 'bold' as const,
        boxShadow: '0 4px 15px rgba(232, 93, 4, 0.2)'
    }
};