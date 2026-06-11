import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import db from "./firebase-config.js";

interface Osoba {
    id: string,
    imie: string,
    nazwisko: string,
    klasa: string,
    czas: string,
}

const parseTimeToMs = (timeStr: string): number => {
    if (!timeStr) return 0
    const cleanStr = timeStr.replace(/\./g, ':')
    const parts = cleanStr.split(':')
    
    if (parts.length < 3) return 0

    const minutes = parseInt(parts[0], 10) * 60 * 1000
    const seconds = parseInt(parts[1], 10) * 1000
    const ms = parseInt(parts[2], 10)

    return minutes + seconds + ms
}

const formatDiff = (diffMs: number): string => {
    if (diffMs <= 0) return "--:--.---"

    const minutes = Math.floor(diffMs / 60000)
    const seconds = Math.floor((diffMs % 60000) / 1000)
    const ms = diffMs % 1000

    const mm = String(minutes).padStart(2, '0')
    const ss = String(seconds).padStart(2, '0')
    const sss = String(ms).padStart(3, '0')

    return `+${mm}:${ss}.${sss}`
}

export default function Simracing() {
    const navigate = useNavigate();
    const [imie, setImie] = useState<string>("")
    const [nazwisko, setNazwisko] = useState<string>("")
    const [klasa, setKlasa] = useState<string>("")
    const [czas, setCzas] = useState<string>("")
    const [isLeaderboard, setIsLeaderboard] = useState<boolean>(false)
    const [switchViewButtonText, setSwtichViewButtonText] = useState<string>("Pokaż Tabelę Wyników")
    const [data, setData] = useState<Osoba[]>([])
    const [error, setError] = useState<string>("")

    const handleCzasChange = (value: string) => {
        const digits = value.replace(/\D/g, "")
        const truncated = digits.slice(0, 7)
        
        let formatted = ""
        if (truncated.length > 0) {
            formatted += truncated.slice(0, 2)
        }
        if (truncated.length > 2) {
            formatted += ":" + truncated.slice(2, 4)
        }
        if (truncated.length > 4) {
            formatted += "." + truncated.slice(4, 7)
        }
        
        setCzas(formatted)
    }

    const addSimracingTime = async () => {
        const timeRegex = /^\d{2}:\d{2}\.\d{3}$/;

        if (!timeRegex.test(czas)) {
            setError("Niepoprawny format czasu! Wymagany format to MM:SS.sss (np. 01:23.456)");
            return;
        }

        setError("");

        try {
            const id = imie + nazwisko + klasa;

            await setDoc(doc(db, "simracing", id), {
                imie,
                nazwisko,
                klasa,
                czas
            });

            alert("Czas został zapisany!");

            setImie("");
            setNazwisko("");
            setKlasa("");
            setCzas("");
        } catch (e) {
            setError("Błąd podczas zapisu do bazy danych.");
            console.error(e);
        }
    };

    const switchView = async () => {
        if (isLeaderboard === false) {
            const querySnapshot = await getDocs(collection(db, "simracing"));
            const fetchedData: Osoba[] = [];
            
            querySnapshot.forEach((doc) => {
                const docData = doc.data();
                fetchedData.push({
                    id: doc.id,
                    imie: docData.imie,
                    nazwisko: docData.nazwisko,
                    klasa: docData.klasa,
                    czas: docData.czas,
                });
            });

            fetchedData.sort((a, b) => parseTimeToMs(a.czas) - parseTimeToMs(b.czas));

            setData(fetchedData)
            setIsLeaderboard(true)
            setSwtichViewButtonText("Powrót do Formularza")
            console.log("Your Project ID is:", import.meta.env.VITE_FIREBASE_PROJECT_ID);
        } else {
            setIsLeaderboard(false)
            setSwtichViewButtonText("Pokaż Tabelę Wyników")
        }
    }

    const leaderTimeMs = data.length > 0 ? parseTimeToMs(data[0].czas) : 0

    return (
        <div style={styles.container}>
            {/* Wstrzyknięcie stylu CSS dla druku */}
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
                    <h1 style={styles.title}>DIRT RALLY 2.0</h1>
                </div>
                <button className="no-print" style={styles.buttonSecondary} onClick={switchView}>
                    {switchViewButtonText}
                </button>
            </div>
            
            <hr style={styles.hr} />

            {
                !isLeaderboard ? (
                    <div style={styles.formContainer}>
                        <h2 style={styles.sectionTitle}>REJESTRACJA CZASU</h2>
                        
                        <label style={styles.label} htmlFor="imie">Imię</label>
                        <input style={styles.input} type="text" value={imie} onChange={(e) => setImie(e.target.value)} placeholder="Imię" />

                        <label style={styles.label} htmlFor="nazwisko">Nazwisko</label>
                        <input style={styles.input} type="text" value={nazwisko} onChange={(e) => setNazwisko(e.target.value)} placeholder="Nazwisko" />

                        <label style={styles.label} htmlFor="klasa">Klasa</label>
                        <input style={styles.input} type="text" value={klasa} onChange={(e) => setKlasa(e.target.value)} placeholder="Klasa" />
                        
                        <label style={styles.label} htmlFor="czas">Czas OS-u</label>
                        <input 
                            style={{...styles.input, ...styles.inputTime}} 
                            type="text" 
                            value={czas} 
                            onChange={(e) => handleCzasChange(e.target.value)} 
                            placeholder="MM:SS.sss (np. 01:24.005)"
                            maxLength={9}
                        />
                        
                        <button style={styles.buttonPrimary} onClick={addSimracingTime}>Zatwierdź Wynik</button>
                        
                        {error && <p style={styles.errorText}>{error}</p>}
                    </div>
                ) : (
                    <div style={styles.leaderboardContainer}>
                        <h2 style={styles.sectionTitle}>TABELA KIEROWCÓW</h2>
                        
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeaderRow}>
                                    <th style={styles.th}>Poz.</th>
                                    <th style={styles.th}>Kierowca</th>
                                    <th style={styles.th}>Klasa</th>
                                    <th style={styles.th}>Czas</th>
                                    <th style={styles.th}>Strata Czasowa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    data.map((item, index) => {
                                        const currentTimeMs = parseTimeToMs(item.czas);
                                        const diffMs = currentTimeMs - leaderTimeMs;
                                        
                                        let rowStyle = styles.tableRow;
                                        let positionColor = '#fff';

                                        if (index === 0) {
                                            rowStyle = styles.tableGoldRow;
                                            positionColor = '#ffd700';
                                        } else if (index === 1) {
                                            rowStyle = styles.tableSilverRow;
                                            positionColor = '#c0c0c0';
                                        } else if (index === 2) {
                                            rowStyle = styles.tableBronzeRow;
                                            positionColor = '#cd7f32';
                                        }

                                        const isOnPodium = index < 3;

                                        return (
                                            <tr key={item.id} style={rowStyle}>
                                                <td style={{...styles.td, fontWeight: 'bold', color: positionColor}}>
                                                    {index + 1}
                                                </td>
                                                <td style={{...styles.td, fontWeight: isOnPodium ? 'bold' : 'normal'}}>{item.imie} {item.nazwisko}</td>
                                                <td style={{...styles.td, color: isOnPodium ? '#fff' : '#aaa'}}>{item.klasa}</td>
                                                <td style={{...styles.td, ...styles.monoFont, color: index === 0 ? '#00ffcc' : '#fff'}}>{item.czas}</td>
                                                <td style={{...styles.td, ...styles.monoFont, color: index === 0 ? '#00ffcc' : '#ff4f00'}}>
                                                    {formatDiff(diffMs)}
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
        backgroundColor: '#121212',
        color: '#ffffff',
        fontFamily: '"Rajdhani", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        padding: '30px',
        borderRadius: '8px',
        margin: '20px auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.8)',
        border: '1px solid #222'
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
        fontSize: '2rem',
        letterSpacing: '2px',
        color: '#fff',
        textTransform: 'uppercase' as const,
        borderLeft: '5px solid #ff4f00',
        paddingLeft: '10px'
    },
    buttonBack: {
        backgroundColor: '#262626',
        color: '#fff',
        border: '1px solid #444',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold' as const,
        fontSize: '0.9rem',
        textTransform: 'uppercase' as const,
        letterSpacing: '1px',
        transition: 'all 0.2s'
    },
    sectionTitle: {
        fontSize: '1.4rem',
        color: '#ff4f00',
        letterSpacing: '1px',
        marginBottom: '20px',
        textTransform: 'uppercase' as const,
        textAlign: 'center' as const,
    },
    hr: {
        borderColor: '#2d2d2d',
        margin: '20px 0'
    },
    formContainer: {
        display: 'flex',
        flexDirection: 'column' as const,
        maxWidth: '450px',
        margin: '0 auto',
        backgroundColor: '#1a1a1a',
        padding: '25px',
        borderRadius: '6px',
        border: '1px solid #2d2d2d'
    },
    label: {
        fontSize: '0.85rem',
        textTransform: 'uppercase' as const,
        color: '#aaa',
        marginBottom: '5px',
        fontWeight: 'bold' as const,
        letterSpacing: '1px'
    },
    input: {
        backgroundColor: '#262626',
        border: '1px solid #444',
        borderRadius: '4px',
        color: '#fff',
        padding: '10px 12px',
        marginBottom: '15px',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    inputTime: {
        borderColor: '#00ffcc',
        fontFamily: 'Courier New, monospace',
        fontSize: '1.2rem',
        letterSpacing: '1px',
        fontWeight: 'bold' as const,
    },
    buttonPrimary: {
        backgroundColor: '#ff4f00',
        color: '#fff',
        border: 'none',
        padding: '12px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold' as const,
        fontSize: '1rem',
        textTransform: 'uppercase' as const,
        letterSpacing: '1px',
        transition: 'background-color 0.2s',
        marginTop: '10px'
    },
    buttonSecondary: {
        backgroundColor: 'transparent',
        color: '#00ffcc',
        border: '2px solid #00ffcc',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold' as const,
        textTransform: 'uppercase' as const,
        letterSpacing: '1px',
        transition: 'all 0.2s',
    },
    errorText: {
        color: '#ff3333',
        fontSize: '0.9rem',
        marginTop: '10px',
        fontWeight: 'bold' as const
    },
    leaderboardContainer: {
        backgroundColor: '#1a1a1a',
        padding: '20px',
        borderRadius: '6px',
        border: '1px solid #2d2d2d',
        overflowX: 'auto' as const
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse' as const,
        textAlign: 'left' as const,
    },
    tableHeaderRow: {
        borderBottom: '2px solid #ff4f00',
    },
    tableRow: {
        borderBottom: '1px solid #2d2d2d',
    },
    tableGoldRow: {
        borderBottom: '2px solid #ffd700',
        backgroundColor: 'rgba(255, 215, 0, 0.08)',
    },
    tableSilverRow: {
        borderBottom: '2px solid #c0c0c0',
        backgroundColor: 'rgba(192, 192, 192, 0.06)',
    },
    tableBronzeRow: {
        borderBottom: '2px solid #cd7f32',
        backgroundColor: 'rgba(205, 127, 50, 0.04)',
    },
    th: {
        padding: '12px 8px',
        color: '#aaa',
        textTransform: 'uppercase' as const,
        fontSize: '0.85rem',
        letterSpacing: '1px'
    },
    td: {
        padding: '12px 8px',
        fontSize: '0.95rem'
    },
    monoFont: {
        fontFamily: 'Courier New, monospace',
        fontWeight: 'bold' as const
    }
};