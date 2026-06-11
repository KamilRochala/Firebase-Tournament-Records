import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import db from "./firebase-config.js";

interface Gracz {
    imie: string;
    nazwisko: string;
    klasa: string;
}

interface Druzyna {
    id: string;
    nazwaDruzyny: string;
    wynik: number;
    gracze: Gracz[];
}

export default function Overcooked() {
    const navigate = useNavigate();
    const [nazwaDruzyny, setNazwaDruzyny] = useState<string>("");
    const [wynik, setWynik] = useState<string>("");
    const [gracze, setGracze] = useState<Gracz[]>([]);
    
    const [nowyImie, setNowyImie] = useState<string>("");
    const [nowyNazwisko, setNowyNazwisko] = useState<string>("");
    const [nowyKlasa, setNowyKlasa] = useState<string>("");

    const [isLeaderboard, setIsLeaderboard] = useState<boolean>(false);
    const [switchViewButtonText, setSwitchViewButtonText] = useState<string>("Pokaż Ranking");
    const [data, setData] = useState<Druzyna[]>([]);
    const [error, setError] = useState<string>("");

    const handleAddGraczDoListy = () => {
        if (!nowyImie || !nowyNazwisko || !nowyKlasa) {
            setError("Wypełnij wszystkie pola gracza przed dodaniem go do drużyny!");
            return;
        }
        setGracze([...gracze, { imie: nowyImie, nazwisko: nowyNazwisko, klasa: nowyKlasa }]);
        setNowyImie("");
        setNowyNazwisko("");
        setNowyKlasa("");
        setError("");
    };

    const addOvercookedScore = async () => {
        if (!nazwaDruzyny || !wynik) {
            setError("Nazwa drużyny i wynik są wymagane!");
            return;
        }
        if (gracze.length === 0) {
            setError("Drużyna musi mieć przynajmniej jednego gracza!");
            return;
        }

        setError("");

        try {
            const druzynaRef = doc(db, "overcooked", nazwaDruzyny);
            await setDoc(druzynaRef, {
                nazwaDruzyny,
                wynik: parseInt(wynik, 10)
            });

            for (const gracz of gracze) {
                const graczId = gracz.imie + gracz.nazwisko + gracz.klasa;
                const graczRef = doc(db, "overcooked", nazwaDruzyny, "gracze", graczId);
                await setDoc(graczRef, gracz);
            }

            setNazwaDruzyny("");
            setWynik("");
            setGracze([]);
            alert("Wynik drużyny Overcooked został zapisany!");
        } catch (e) {
            setError("Błąd podczas zapisu do bazy danych.");
            console.error(e);
        }
    };

    const switchView = async () => {
        if (isLeaderboard === false) {
            const querySnapshot = await getDocs(collection(db, "overcooked"));
            const fetchedTeams: Druzyna[] = [];
            
            for (const teamDoc of querySnapshot.docs) {
                const teamData = teamDoc.data();
                
                const graczeSnapshot = await getDocs(collection(db, "overcooked", teamDoc.id, "gracze"));
                const fetchedGracze: Gracz[] = [];
                
                graczeSnapshot.forEach((graczDoc) => {
                    const gData = graczDoc.data();
                    fetchedGracze.push({
                        imie: gData.imie,
                        nazwisko: gData.nazwisko,
                        klasa: gData.klasa
                    });
                });

                fetchedTeams.push({
                    id: teamDoc.id,
                    nazwaDruzyny: teamData.nazwaDruzyny,
                    wynik: teamData.wynik,
                    gracze: fetchedGracze
                });
            }

            fetchedTeams.sort((a, b) => b.wynik - a.wynik);

            setData(fetchedTeams);
            setIsLeaderboard(true);
            setSwitchViewButtonText("Powrót do Formularza");
        } else {
            setIsLeaderboard(false);
            setSwitchViewButtonText("Pokaż Ranking");
        }
    };

    const leaderScore = data.length > 0 ? data[0].wynik : 0;

    return (
        <div style={styles.container}>
            <style>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            <div style={styles.headerZone}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button className="no-print" style={styles.buttonBack} onClick={() => navigate("/")}>Menu</button>
                    <h1 style={styles.title}>OVERCOOKED</h1>
                </div>
                <button className="no-print" style={styles.buttonSecondary} onClick={switchView}>
                    {switchViewButtonText}
                </button>
            </div>
            
            <hr style={styles.hr} />

            {
                !isLeaderboard ? (
                    <div style={styles.formContainer}>
                        <h2 style={styles.sectionTitle}>NOWY WPIS</h2>
                        
                        <label style={styles.label}>Nazwa Drużyny</label>
                        <input style={styles.input} type="text" value={nazwaDruzyny} onChange={(e) => setNazwaDruzyny(e.target.value)} placeholder="np. Ostry Sos" />

                        <label style={styles.label}>Wynik (Punkty)</label>
                        <input style={{...styles.input, ...styles.inputScore}} type="number" value={wynik} onChange={(e) => setWynik(e.target.value)} placeholder="np. 1420" />

                        <fieldset style={styles.fieldset}>
                            <legend style={styles.legend}>Dodaj Kucharza do Drużyny</legend>
                            
                            <input style={styles.inputSmall} type="text" value={nowyImie} onChange={(e) => setNowyImie(e.target.value)} placeholder="Imię" />
                            <input style={styles.inputSmall} type="text" value={nowyNazwisko} onChange={(e) => setNowyNazwisko(e.target.value)} placeholder="Nazwisko" />
                            <input style={styles.inputSmall} type="text" value={nowyKlasa} onChange={(e) => setNowyKlasa(e.target.value)} placeholder="Klasa" />
                            
                            <button type="button" style={styles.buttonAddPlayer} onClick={handleAddGraczDoListy}>
                                + Dodaj Kucharza
                            </button>
                        </fieldset>

                        {gracze.length > 0 && (
                            <div style={styles.playerPreviewList}>
                                <strong>Skład drużyny:</strong>
                                <ul>
                                    {gracze.map((g, idx) => (
                                        <li key={idx}>{g.imie} {g.nazwisko} ({g.klasa})</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        <button style={styles.buttonPrimary} onClick={addOvercookedScore}>Wydaj Danie (Wyślij)</button>
                        
                        {error && <p style={styles.errorText}>{error}</p>}
                    </div>
                ) : (
                    <div style={styles.leaderboardContainer}>
                        <h2 style={styles.sectionTitle}>RANKING SZEFÓW KUCHNI</h2>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeaderRow}>
                                    <th style={styles.th}>Miejsce</th>
                                    <th style={styles.th}>Drużyna</th>
                                    <th style={styles.th}>Skład (Gracze)</th>
                                    <th style={styles.th}>Wynik</th>
                                    <th style={styles.th}>Różnica (DIFF)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    data.map((item, index) => {
                                        let rowStyle = styles.tableRow;
                                        let rankColor = '#252422';
                                        const diffScore = item.wynik - leaderScore;

                                        if (index === 0) {
                                            rowStyle = styles.tableGoldRow;
                                            rankColor = '#b58900'; 
                                        } else if (index === 1) {
                                            rowStyle = styles.tableSilverRow;
                                            rankColor = '#718096';
                                        } else if (index === 2) {
                                            rowStyle = styles.tableBronzeRow;
                                            rankColor = '#b85c00';
                                        }

                                        return (
                                            <tr key={item.id} style={rowStyle}>
                                                <td style={{...styles.td, fontWeight: 'bold', color: rankColor, fontSize: index < 3 ? '1.1rem' : '1rem'}}>
                                                    {index + 1}
                                                </td>
                                                <td style={{...styles.td, fontWeight: 'bold'}}>{item.nazwaDruzyny}</td>
                                                <td style={styles.td}>
                                                    {item.gracze.map((g, idx) => (
                                                        <div key={idx} style={styles.playerTag}>
                                                            {g.imie} {g.nazwisko} <span style={{fontSize: '0.8rem', color: '#666'}}>({g.klasa})</span>
                                                        </div>
                                                    ))}
                                                </td>
                                                <td style={{...styles.td, ...styles.scoreFont, color: index === 0 ? '#d00000' : '#e85d04'}}>
                                                    {item.wynik} pkt
                                                </td>
                                                <td style={{...styles.td, ...styles.scoreFont, color: index === 0 ? '#b58900' : '#d00000'}}>
                                                    {index === 0 ? "Lider" : `${diffScore} pkt`}
                                                </td>
                                            </tr>
                                        );
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                )
            }
            <p>Autor: Kamil Rochala 4TIP</p>
        </div>
    );
}

const styles = {
    container: {
        backgroundColor: '#fffcf2',
        color: '#252422',
        fontFamily: '"Comic Sans MS", "Chalkboard SE", "Segoe UI", sans-serif',
        padding: '30px',
        borderRadius: '24px',
    
        margin: '20px auto',
        boxShadow: '0 8px 30px rgba(232, 93, 4, 0.15)',
        border: '4px solid #ffb703'
    },
    headerZone: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap' as const,
        gap: '15px'
    },
    title: {
        margin: 0,
        fontSize: '2.2rem',
        color: '#d00000',
        textShadow: '2px 2px #ffb703',
        letterSpacing: '1px'
    },
    buttonBack: {
        backgroundColor: '#ffb703',
        color: '#fff',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '12px',
        cursor: 'pointer',
        fontWeight: 'bold' as const,
        fontSize: '0.9rem',
        textTransform: 'uppercase' as const,
        boxShadow: '0 3px #fb8500',
    },
    sectionTitle: {
        fontSize: '1.5rem',
        color: '#e85d04',
        marginBottom: '20px',
        textAlign: 'center' as const
    },
    hr: {
        borderColor: '#ffb703',
        borderWidth: '2px',
        borderStyle: 'dashed' as const,
        margin: '20px 0'
    },
    formContainer: {
        display: 'flex',
        flexDirection: 'column' as const,
        maxWidth: '500px',
        margin: '0 auto',
        backgroundColor: '#f1f0ea',
        padding: '25px',
        borderRadius: '20px',
        border: '2px solid #ccc'
    },
    label: {
        fontSize: '0.95rem',
        color: '#252422',
        marginBottom: '5px',
        fontWeight: 'bold' as const,
    },
    input: {
        backgroundColor: '#fff',
        border: '2px solid #ccc',
        borderRadius: '12px',
        color: '#333',
        padding: '10px 12px',
        marginBottom: '15px',
        fontSize: '1rem',
        outline: 'none',
    },
    inputScore: {
        borderColor: '#e85d04',
        fontSize: '1.3rem',
        fontWeight: 'bold' as const,
        color: '#e85d04'
    },
    fieldset: {
        border: '2px dashed #ffb703',
        borderRadius: '12px',
        padding: '15px',
        marginBottom: '15px',
        backgroundColor: '#fff'
    },
    legend: {
        fontWeight: 'bold' as const,
        color: '#fb8500',
        padding: '0 5px'
    },
    inputSmall: {
        width: '90%',
        backgroundColor: '#f8f9fa',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '8px',
        marginBottom: '8px',
        display: 'block'
    },
    buttonAddPlayer: {
        backgroundColor: '#fb8500',
        color: '#fff',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold' as const,
    },
    playerPreviewList: {
        backgroundColor: '#fff',
        padding: '10px',
        borderRadius: '12px',
        marginBottom: '15px',
        fontSize: '0.9rem',
        border: '1px solid #ddd'
    },
    buttonPrimary: {
        backgroundColor: '#d00000',
        color: '#fff',
        border: 'none',
        padding: '14px',
        borderRadius: '16px',
        cursor: 'pointer',
        fontWeight: 'bold' as const,
        fontSize: '1.2rem',
        boxShadow: '0 4px #9b0000',
        transition: 'transform 0.1s',
    },
    buttonSecondary: {
        backgroundColor: '#ffb703',
        color: '#fff',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '14px',
        cursor: 'pointer',
        fontWeight: 'bold' as const,
        boxShadow: '0 3px #fb8500',
    },
    errorText: {
        color: '#d00000',
        fontSize: '0.95rem',
        marginTop: '10px',
        textAlign: 'center' as const,
        fontWeight: 'bold' as const
    },
    leaderboardContainer: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '20px',
        border: '2px solid #ffb703',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse' as const,
    },
    tableHeaderRow: {
        borderBottom: '3px solid #ffb703',
    },
    tableRow: {
        borderBottom: '1px solid #eee',
    },
    tableGoldRow: {
        borderBottom: '3px solid #ffb703',
        backgroundColor: '#fff5cc', 
        outline: '1px solid #ffd700'
    },
    tableSilverRow: {
        borderBottom: '3px solid #ffb703',
        backgroundColor: '#f0f4f8', 
        outline: '1px solid #cbd5e0'
    },
    tableBronzeRow: {
        borderBottom: '3px solid #ffb703',
        backgroundColor: '#fff0e6', 
        outline: '1px solid #ed8936'
    },
    th: {
        padding: '12px 8px',
        color: '#fb8500',
        fontSize: '1rem',
        textAlign: 'left' as const
    },
    td: {
        padding: '12px 8px',
        verticalAlign: 'top' as const
    },
    playerTag: {
        backgroundColor: '#e2e0d6',
        padding: '3px 8px',
        borderRadius: '6px',
        marginBottom: '4px',
        display: 'inline-block',
        marginRight: '5px',
        fontSize: '0.9rem'
    },
    scoreFont: {
        fontSize: '1.2rem',
        fontWeight: 'bold' as const,
    }
};