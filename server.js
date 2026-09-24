const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// Datos iniciales por defecto si no existe la base de datos
const initialData = {
    usuarios: [
        { username: "admin", password: "1234", nombre: "Administrador General", rol: "Administrador", permisos: { dashboard: true, dirigentes: true, apoyos: true, inventario: true, electoral: true, crearDir: true, crearApo: true, crearInv: true, usuarios: true } },
        { username: "oficinista", password: "5678", nombre: "David Tejeda (Oficinista)", rol: "Gestor", permisos: { dashboard: true, dirigentes: true, apoyos: true, inventario: true, electoral: false, crearDir: true, crearApo: true, crearInv: true, usuarios: false } },
        { username: "consultor", password: "0000", nombre: "Supervisor Externo", rol: "Consultor", permisos: { dashboard: true, dirigentes: true, apoyos: true, inventario: true, electoral: true, crearDir: false, crearApo: false, crearInv: false, usuarios: false } }
    ],
    inventario: [
        { codigo: "INV-001", nombre: "Bolsas de Arroz 20lbs", categoria: "Alimentos", cantidad: 85, ubicacion: "Estante Principal - Estante 1" },
        { codigo: "INV-002", nombre: "Balones de Fútbol Profesional", categoria: "Deportes", cantidad: 12, ubicacion: "Sección Deportes - Caja 2" },
        { codigo: "INV-003", nombre: "Suéteres Deportivos (Talla M/L)", categoria: "Textil / Promocional", cantidad: 45, ubicacion: "Rack Textil - Nivel 2" },
        { codigo: "INV-004", nombre: "Manillas de Béisbol Cuero", categoria: "Deportes", cantidad: 8, ubicacion: "Sección Deportes - Caja 1" }
    ],
    apoyos: [
        { dirigente: "Adiel Vargas Moran", cedula: "2-708-363", tipo: "ECONOMICO", desc: "2 BOLSAS DE ARROZ", monto: "$16.00", fecha: "2026-09-22" },
        { dirigente: "Rigoberto Manuel Romero Sánchez", cedula: "8-747-2063", tipo: "ECONOMICO", desc: "6 Bolsas de Arroz y Dos Balones de Futbol", monto: "$68.00", fecha: "2026-09-22" },
        { dirigente: "Rigoberto Manuel Romero Sánchez", cedula: "8-747-2063", tipo: "ECONOMICO", desc: "15 Sueter Deportivo", monto: "$60.00", fecha: "2026-09-22" },
        { dirigente: "Efraín Rodriguez", cedula: "2-703-1689", tipo: "OTRO", desc: "2 Manillas de Béisbol", monto: "$30.00", fecha: "2026-09-21" },
        { dirigente: "Eladio Gordón", cedula: "2-720-2307", tipo: "ECONOMICO", desc: "5 BOLSAS DE ARROZ", monto: "$40.00", fecha: "2026-09-21" },
        { dirigente: "Dario Moran R.", cedula: "2-101-1462", tipo: "ECONOMICO", desc: "Efectivo", monto: "$15.00", fecha: "2026-09-17" }
    ],
    dirigientes: null
};

// Generar base de datos inicial de dirigentes si no existe
function generarDirigientesIniciales() {
    let lista = [
        { id: 1, nombre: "JUAN OVALLE", cedula: "2-156-940", tel: "6928-1882", corr: "Río Indio", com: "U CENTRO", coord: "LUIS GUARDIA", part: "Regular" },
        { id: 2, nombre: "RAFAELA MARÍA MORAN", cedula: "2-724-2039", tel: "6977-7585", corr: "General Victoriano Lorenzo", com: "Guabal", coord: "MARIA TOMASA", part: "Regular" },
        { id: 3, nombre: "ANGELICA MENDOZA", cedula: "2-736-1103", tel: "6914-1382", corr: "Chiguirí Arriba", com: "Chiguirí", coord: "MARÍA JOSÉ RUIZ", part: "Regular" },
        { id: 4, nombre: "GLORIA CHIRÚ", cedula: "2-747-155", tel: "6882-4720", corr: "Toabré", com: "Tambo", coord: "MIRNA FERNÁNDEZ", part: "Regular" },
        { id: 5, nombre: "DONICIO VALDES", cedula: "2-757-108", tel: "6836-1527", corr: "Toabré", com: "Tambo", coord: "MIRNA FERNÁNDEZ", part: "Regular" }
    ];
    const corregimientosList = ["Toabré", "Río Indio", "Chiguirí Arriba", "General Victoriano Lorenzo", "Coclesito", "Pajonal", "Tulú"];
    const comunidadesList = ["Centro", "Sector Norte", "Guabal", "Tambo", "El Harino", "Boca de Salado", "Cerro Pela"];
    const coordinadoresList = ["MIRNA FERNÁNDEZ", "LUIS GUARDIA", "MARÍA JOSÉ RUIZ", "CARLOS PÉREZ", "ANA GÓMEZ"];
    const participacionList = ["Regular", "Buena", "Regular", "Regular", "Buena", "Regular", "Mala"];

    for (let i = 6; i <= 841; i++) {
        let nombresArr = ["JUAN", "MARÍA", "CARLOS", "ANA", "JOSÉ", "LUIS", "ROSA", "MANUEL", "CARMEN", "PEDRO"];
        let apellidosArr = ["TELLO", "GÓMEZ", "RÍOS", "SÁNCHEZ", "MORALES", "RODRÍGUEZ", "CASTILLO", "JIMÉNEZ", "HERRERA", "GONZÁLEZ"];
        lista.push({
            id: i,
            nombre: `${nombresArr[i % nombresArr.length]} ${apellidosArr[(i * 3) % apellidosArr.length]} ${apellidosArr[i % apellidosArr.length]}`,
            cedula: `2-${Math.floor((i * 17) % 700 + 100)}-${Math.floor((i * 31) % 9000 + 1000)}`,
            tel: `6${Math.floor((i * 23) % 900 + 100)}-${Math.floor((i * 41) % 9000 + 1000)}`,
            corr: corregimientosList[i % corregimientosList.length],
            com: comunidadesList[i % comunidadesList.length],
            coord: coordinadoresList[i % coordinadoresList.length],
            part: participacionList[i % participacionList.length]
        });
    }
    return lista;
}

if (!fs.existsSync(DB_FILE)) {
    initialData.dirigientes = generarDirigientesIniciales();
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

// Endpoints de API para sincronizar datos con el servidor
app.get('/api/data', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    res.json(data);
});

app.post('/api/data', (req, res) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
