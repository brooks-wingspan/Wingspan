"""
UFO PICTURE FRAME  -  parametric 3D CAD model (CadQuery / OpenCascade B-rep).

Builds ONE solid and exports STEP + STL, plus verification cross-sections.

Coordinate system:  X = width, Y = height, Z = depth.
Z = 0 is the BACK face (against the wall); +Z toward the viewer.
Part is symmetric about X = 0.  All units are INCHES.

DOME TREATMENT (sculpted "water-slide" step, seamless):
The dome front is a flat panel sitting DOME_DROP below the frame face, joined to the
frame by a smooth OGEE step made of two tangent circular arcs -- subtly concave as it
rolls off the frame, inflecting to convex as it settles onto the dome.  The step is
swept straight across X, so where the dome narrows into the rail (the tangent points
x = +/-3.928) it naturally fades to flush -- no step, no cusp, no hard line.  Analytic
arcs (not a spline) keep the surface watertight when meshed.  The transitions are
tangent (G1): smooth, no crease -- on a painted FDM part there is no visible line.
"""
import math
import numpy as np
import cadquery as cq
from OCP.BRepCheck import BRepCheck_Analyzer

# ============================ PARAMETERS (inches) ============================
OUTER_W, OUTER_H = 16.250, 14.000     # outer silhouette
OUTER_R          = 0.250              # silhouette corner radius (4 places) - exact
WIN_W,  WIN_H    = 12.250, 10.000     # window opening
WIN_R            = 0.750              # window corner radius
BODY_D           = 0.625              # body depth (frame front face Z)
TOP_RAIL_Y       = 7.000             # top rail line (= OUTER_H/2)

POCKET_W, POCKET_H = 12.625, 10.625   # back pocket
POCKET_R           = 0.125            # pocket corner radius
POCKET_DEPTH       = 0.375            # pocket depth from back (flat, one depth)

# --- dome silhouette geometry (Sheet 5) ---
JOIN_CX, JOIN_CY = 3.928, 9.000       # joiner arc centres (+/-JOIN_CX)
TAN_X, TAN_Y     = 2.500, 7.600       # crown/joiner tangent point
APEX             = (0.000, 8.650)     # crown apex

# --- dome "water-slide" step ---
DOME_DROP  = 0.075     # dome flat sits this far below the frame face (lower profile)
STEP_RUN   = 0.600     # Y-length of the ogee step (bigger = gentler / more spread)
# The slope begins on the SAME line where the rail's front round-over begins
# (inset from the top-rail line by the front round-over radius), so the whole top
# reads as one continuous line: rail rounding -> dome slope -> rail rounding.
STEP_START_Y = TOP_RAIL_Y - 0.245    # = 6.755: the slope begins on the SAME line where the
                                     # rail's front round-over begins (top rail minus R_FRONT_OUTER),
                                     # so the whole top reads as one continuous line.

# --- round-overs ---
R_FRONT_OUTER   = 0.245               # front outer edge (spec 0.250; -0.005 build*)
R_DOME          = 0.225               # dome outer edge (max the dome geometry accepts;
                                      # reads as the same constant round-over as R_FRONT_OUTER)
R_BACK_OUTER    = 0.125               # back outer edge
R_FRONT_WINDOW  = 0.1875              # front window edge
# *front round-over is 0.005 in under the 0.250 spec so it never exactly equals the
#  0.250 corner radius -- equal radii create a corner OCC cannot mesh watertight.
#  0.005 in (~0.13 mm) is well below FDM print resolution.

# --- keyhole (back face, one only, Detail C) ---
KH_C = (0.000, 6.000); KH_DIA = 0.400
KH_SLOT_W = 0.220; KH_SLOT_TOP_Y = 6.550; KH_DEPTH = 0.280

# --- pilot holes (back face, 6 places) ---
PILOT_DIA = 0.098; PILOT_DEPTH = 0.350
PILOT_XY = [( 3.500,  5.5625), (-3.500,  5.5625),
            ( 3.500, -5.5625), (-3.500, -5.5625),
            ( 6.5625, 0.000),  (-6.5625, 0.000)]

TOL = 1e-4
hw, hh = OUTER_W / 2.0, OUTER_H / 2.0
DOME_Z  = BODY_D - DOME_DROP                                   # 0.500
_ARC_R  = ((DOME_DROP / 2.0) ** 2 + (STEP_RUN / 2.0) ** 2) / DOME_DROP  # ogee arc radius
VERBOSE = True

# ============================ helpers ============================

def _arc_mid(cx, cy, ax, ay, bx, by):
    """Geometric midpoint of the MINOR arc A->B about centre C (for threePointArc)."""
    r = math.hypot(ax - cx, ay - cy)
    a0 = math.atan2(ay - cy, ax - cx); a1 = math.atan2(by - cy, bx - cx)
    d = a1 - a0
    while d > math.pi:  d -= 2 * math.pi
    while d < -math.pi: d += 2 * math.pi
    am = a0 + d / 2.0
    return (cx + r * math.cos(am), cy + r * math.sin(am))

def _corner_mid(cx, cy, deg):
    return (cx + OUTER_R * math.cos(math.radians(deg)),
            cy + OUTER_R * math.sin(math.radians(deg)))

def _log(b, label):
    if VERBOSE:
        print(f"  [{label}] solids={len(b.solids().vals())} "
              f"valid={BRepCheck_Analyzer(b.val().wrapped).IsValid()}")
    return b

def _bb(e): return e.BoundingBox()
def _flat(e, z):
    b = _bb(e); return abs(b.zmin - z) < TOL and abs(b.zmax - z) < TOL
def _outer_reach(e):
    b = _bb(e)
    return (max(abs(b.xmin), abs(b.xmax)) > 6.5) or (max(abs(b.ymin), abs(b.ymax)) > 5.5)

def _fillet(b, edges, r, label):
    if not edges:
        raise RuntimeError(f"{label}: no edges selected")
    out = cq.Workplane(obj=b.val().fillet(r, edges))
    _log(out, f"{label} ({len(edges)} edges @R{r})")
    return out


def outer_wire():
    """Full outer silhouette: rounded rectangle whose top edge carries the dome.
    Crown + both joiners + top rail form ONE continuous tangent curve."""
    return (cq.Workplane("XY")
            .moveTo(-hw, -6.75).lineTo(-hw, 6.75)
            .threePointArc(_corner_mid(-7.875, 6.75, 135), (-7.875, hh))
            .lineTo(-JOIN_CX, TOP_RAIL_Y)
            .threePointArc(_arc_mid(-JOIN_CX, JOIN_CY, -JOIN_CX, TOP_RAIL_Y, -TAN_X, TAN_Y), (-TAN_X, TAN_Y))
            .threePointArc(APEX, (TAN_X, TAN_Y))
            .threePointArc(_arc_mid(JOIN_CX, JOIN_CY, TAN_X, TAN_Y, JOIN_CX, TOP_RAIL_Y), (JOIN_CX, TOP_RAIL_Y))
            .lineTo(7.875, hh)
            .threePointArc(_corner_mid(7.875, 6.75, 45), (hw, 6.75))
            .lineTo(hw, -6.75)
            .threePointArc(_corner_mid(7.875, -6.75, -45), (7.875, -hh))
            .lineTo(-7.875, -hh)
            .threePointArc(_corner_mid(-7.875, -6.75, 225), (-hw, -6.75))
            .close())


def _is_dome_arc(e):
    """A crown/joiner silhouette arc (the dome's outer outline), any Z."""
    b = e.BoundingBox()
    return (e.geomType() == "CIRCLE" and b.ymax > TOP_RAIL_Y + TOL
            and max(abs(b.xmin), abs(b.xmax)) < JOIN_CX + 0.02)


def dome_cutter():
    """Straight two-arc ogee cross-section (Y-Z), swept across X and LIMITED to the
    dome column (|x| < JOIN_CX) so the rails stay flat.  The slope begins on ONE
    dead-straight horizontal line at STEP_START_Y."""
    y0 = STEP_START_Y
    yi, zi = y0 + STEP_RUN / 2.0, BODY_D - DOME_DROP / 2.0
    cmid = _arc_mid(y0, BODY_D - _ARC_R, y0, BODY_D, yi, zi)
    vmid = _arc_mid(y0 + STEP_RUN, DOME_Z + _ARC_R, yi, zi, y0 + STEP_RUN, DOME_Z)
    sec = (cq.Workplane("YZ")
           .moveTo(y0 - 0.6, BODY_D + 0.3).lineTo(y0, BODY_D)
           .threePointArc(cmid, (yi, zi)).threePointArc(vmid, (y0 + STEP_RUN, DOME_Z))
           .lineTo(y0 + 3.0, DOME_Z).lineTo(y0 + 3.0, 1.1)
           .lineTo(y0 - 0.6, 1.1).close())
    ogee = sec.extrude(OUTER_W + 6).translate((-hw - 3, 0, 0))
    band = cq.Workplane("XY").box(2 * JOIN_CX, OUTER_H + 8, 4).val()  # dome column only -> rails flat
    return ogee.intersect(band)


def build():
    body = outer_wire().extrude(BODY_D)
    _log(body, "silhouette prism")

    # Round the rails/sides/bottom + corners on the flat prism (front R0.245 + back
    # R0.125), but NOT the dome outline.  Then cut the dome, then round the dome's
    # outline AFTER the cut -- as a proper full tangent round-over (in chunks, at the
    # largest radius each chunk accepts, R_DOME) so it matches the frame instead of the
    # sliced partial round the "round-first" order produced.
    front = [e for e in body.val().Edges()
             if _flat(e, BODY_D) and _outer_reach(e) and not _is_dome_arc(e)]
    body = _fillet(body, front, R_FRONT_OUTER, "front outer (rails, not dome)")
    back = [e for e in body.val().Edges() if _flat(e, 0.0) and _outer_reach(e)]
    body = _fillet(body, back, R_BACK_OUTER, "back outer")

    body = body.cut(dome_cutter())
    _log(body, "dome ogee step")

    # dome outer round-over, chunked, after the cut (full tangent round, matches frame)
    dome = [e for e in body.val().Edges()
            if _is_dome_arc(e) and abs(_bb(e).zmax - DOME_Z) < 0.02 and e.Length() > 0.25]
    body = _fillet(body, dome, R_DOME, "dome outer round-over (chunked)")

    # window (through) + pocket (from back).  Pocket corners are SHARP 90 deg so a
    # square-cut piece of glass drops in clean (no radius to fight).
    win = (cq.Workplane("XY").workplane(offset=-0.1).rect(WIN_W, WIN_H)
           .extrude(BODY_D + 0.2).edges("|Z").fillet(WIN_R))
    body = body.cut(win)
    pk = (cq.Workplane("XY").workplane(offset=-0.1).rect(POCKET_W, POCKET_H)
          .extrude(POCKET_DEPTH + 0.1))
    body = body.cut(pk)
    _log(body, "window + pocket (sharp pocket corners)")

    # front window round-over
    fw = [e for e in body.val().Edges() if _flat(e, BODY_D) and not _outer_reach(e)]
    body = _fillet(body, fw, R_FRONT_WINDOW, "front window")

    # keyhole + pilot holes LAST (back face, +Z into the part)
    kh = (cq.Workplane("XY").workplane(offset=-0.1)
          .moveTo(*KH_C).circle(KH_DIA / 2.0)
          .moveTo(0, (KH_C[1] + KH_SLOT_TOP_Y) / 2.0).rect(KH_SLOT_W, KH_SLOT_TOP_Y - KH_C[1])
          .moveTo(0, KH_SLOT_TOP_Y).circle(KH_SLOT_W / 2.0)
          .extrude(KH_DEPTH + 0.1))
    body = body.cut(kh)
    for (px, py) in PILOT_XY:
        pin = (cq.Workplane("XY").workplane(offset=-0.1)
               .moveTo(px, py).circle(PILOT_DIA / 2.0).extrude(PILOT_DEPTH + 0.1))
        body = body.cut(pin)
    _log(body, "keyhole + pilots")
    return body


def export_stl(shape_wrapped, path, lin=0.0015, ang=0.1):
    """Watertight STL: OCC incremental mesher, then drop zero-area (degenerate) facets
    that OCC leaves at the two dome/rail pinch singularities."""
    import numpy as _np, trimesh as _tm
    from OCP.BRepMesh import BRepMesh_IncrementalMesh
    from OCP.StlAPI import StlAPI_Writer
    BRepMesh_IncrementalMesh(shape_wrapped, lin, False, ang, True)
    tmp = path + ".raw.stl"
    w = StlAPI_Writer(); w.ASCIIMode = False; w.Write(shape_wrapped, tmp)
    m = _tm.load(tmp); m.merge_vertices()
    tri = m.vertices[m.faces]
    area = _np.linalg.norm(_np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0]), axis=1)
    m.update_faces(area > 1e-12); m.remove_unreferenced_vertices(); m.merge_vertices()
    _tm.repair.fix_normals(m)
    m.export(path)
    import os as _os
    _os.remove(tmp)


if __name__ == "__main__":
    print(f"ogee arc R = {_ARC_R:.3f} in  (drop {DOME_DROP}, run {STEP_RUN})")
    result = build()
    print("solids:", len(result.solids().vals()))
    cq.exporters.export(result, "ufo_frame.step")
    export_stl(result.val().wrapped, "ufo_frame.stl")
    print("exported ufo_frame.step + ufo_frame.stl")
