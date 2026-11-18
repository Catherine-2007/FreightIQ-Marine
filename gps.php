<?php
require_once __DIR__ . '/../middleware/security.php';
require_once __DIR__ . '/../config/db.php';
header('Content-Type: application/json');
require_permission('gps.view');
$pdo = get_db();

$vessels = $pdo->query(
    "SELECT v.id, v.vessel_name, v.imo_number, v.availability, v.dwt, v.loa_m, v.beam_m, v.draft_m,
            v.flag, v.eta, vc.class_name,
            vp.latitude, vp.longitude, vp.speed_knots, vp.heading_deg, vp.data_source
     FROM vessels v JOIN vessel_classes vc ON vc.id=v.class_id
     JOIN vessel_positions vp ON vp.id = (SELECT MAX(id) FROM vessel_positions WHERE vessel_id=v.id)"
)->fetchAll();

$ports = $pdo->query(
    "SELECT p.id, p.name, p.latitude, p.longitude, p.max_draft_m, p.max_loa_m, p.max_beam_m, p.cargo_handling_capacity_tpd,
            pc.congestion_level, pc.congestion_index
     FROM ports p LEFT JOIN port_congestion pc ON pc.id=(SELECT MAX(id) FROM port_congestion WHERE port_id=p.id)"
)->fetchAll();

$origins = $pdo->query("SELECT id, country, load_point, latitude, longitude FROM origins")->fetchAll();

// Trade lanes (origin load point -> destination port) for the animated lane overlay.
$lanes = $pdo->query(
    "SELECT r.id, o.load_point, o.country, o.latitude AS o_lat, o.longitude AS o_lon,
            p.name AS port_name, p.latitude AS p_lat, p.longitude AS p_lon, c.name AS commodity, r.distance_nm
     FROM routes r JOIN origins o ON o.id=r.origin_id JOIN ports p ON p.id=r.destination_port_id
     JOIN commodities c ON c.id=r.commodity_id"
)->fetchAll();

echo json_encode([
    'vessels' => $vessels,
    'ports' => $ports,
    'origins' => $origins,
    'lanes' => $lanes,
    'data_source' => 'Simulated vessel positions for demonstration — not live AIS. Architecture supports plugging in a real AIS provider (see docs/architecture.md).',
]);
