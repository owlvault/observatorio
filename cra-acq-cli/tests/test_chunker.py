"""
Pruebas Unitarias: Segmentación y Puntos de Control (RF-SUI-10)
"""

from cra_acq.pipeline.chunker import generate_provider_chunks, CheckpointManager


def test_generate_provider_chunks_slicing():
    # 550 prestadores en bloques de 200 -> 3 chunks: (1-200, 201-400, 401-550)
    chunks = generate_provider_chunks(min_id=1, max_id=550, chunk_size=200)
    
    assert len(chunks) == 3
    assert chunks[0] == (1, 1, 200)
    assert chunks[1] == (2, 201, 400)
    assert chunks[2] == (3, 401, 550)


def test_generate_provider_chunks_resume():
    # Reanudar desde el prestador 400
    chunks = generate_provider_chunks(min_id=1, max_id=600, chunk_size=200, start_from_id=400)
    
    assert len(chunks) == 1
    assert chunks[0] == (1, 401, 600)


def test_checkpoint_persistence(tmp_path):
    mgr = CheckpointManager(batch_id="TEST-BATCH-01", state_dir=tmp_path)
    
    # Guardar estado
    mgr.save_checkpoint(
        domain_name="BALANCE_HIDRICO",
        reporting_period="2026-08",
        chunk_sequence=2,
        last_provider_id=400,
        records_in_chunk=150,
        is_completed=False
    )

    # Recuperar estado
    latest = mgr.load_latest_checkpoint()
    assert latest is not None
    assert latest.batch_id == "TEST-BATCH-01"
    assert latest.last_provider_id == 400
    assert latest.chunk_sequence == 2
    assert latest.is_completed is False

    # Limpiar estado
    mgr.clear()
    assert mgr.load_latest_checkpoint() is None
