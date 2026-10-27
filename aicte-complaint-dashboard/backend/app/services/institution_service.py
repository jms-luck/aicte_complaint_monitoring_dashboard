from __future__ import annotations

import math
import uuid
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.institution import Institution, InstitutionAlias
from app.models.user import User
from app.schemas.institution import (
    InstitutionAliasCreate,
    InstitutionCreate,
    InstitutionUpdate,
)
from app.services.audit_service import log_action


# ── Helpers ────────────────────────────────────────────────────────────────────

def _get_or_404(institution_id: uuid.UUID, db: Session) -> Institution:
    inst = db.get(Institution, institution_id)
    if inst is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Institution {institution_id} not found",
        )
    return inst


# ── CRUD ───────────────────────────────────────────────────────────────────────

def create_institution(
    *,
    data: InstitutionCreate,
    db: Session,
    actor: Optional[User] = None,
) -> Institution:
    # Duplicate permanent_id check
    if data.permanent_id:
        existing = db.execute(
            select(Institution).where(Institution.permanent_id == data.permanent_id)
        ).scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"An institution with permanent_id '{data.permanent_id}' already exists.",
            )

    inst = Institution(
        **data.model_dump(),
        created_by_id=actor.id if actor else None,
    )
    db.add(inst)
    db.flush()

    log_action(
        entity_type="institution",
        entity_id=inst.id,
        action="created",
        actor=actor,
        new_val={"name": inst.name, "permanent_id": inst.permanent_id},
        db=db,
    )
    db.commit()
    db.refresh(inst)
    return inst


def update_institution(
    *,
    institution_id: uuid.UUID,
    data: InstitutionUpdate,
    db: Session,
    actor: Optional[User] = None,
) -> Institution:
    inst = _get_or_404(institution_id, db)

    # Duplicate permanent_id check on update
    if data.permanent_id and data.permanent_id != inst.permanent_id:
        conflict = db.execute(
            select(Institution).where(
                Institution.permanent_id == data.permanent_id,
                Institution.id != institution_id,
            )
        ).scalar_one_or_none()
        if conflict:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"An institution with permanent_id '{data.permanent_id}' already exists.",
            )

    old_vals = {k: str(getattr(inst, k)) for k in data.model_fields_set}
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(inst, field, value)

    log_action(
        entity_type="institution",
        entity_id=inst.id,
        action="updated",
        actor=actor,
        old_val=old_vals,
        new_val=data.model_dump(exclude_unset=True),
        db=db,
    )
    db.commit()
    db.refresh(inst)
    return inst


def get_institution(institution_id: uuid.UUID, db: Session) -> Institution:
    return _get_or_404(institution_id, db)


def list_institutions(
    *,
    db: Session,
    name: Optional[str] = None,
    permanent_id: Optional[str] = None,
    state: Optional[str] = None,
    region_id: Optional[uuid.UUID] = None,
    institution_type: Optional[str] = None,
    is_active: Optional[bool] = None,
    page: int = 1,
    page_size: int = 20,
):
    from sqlalchemy import or_
    stmt = select(Institution)

    if name:
        # Search across name AND permanent_id simultaneously
        stmt = stmt.where(
            or_(
                Institution.name.ilike(f"%{name}%"),
                Institution.permanent_id.ilike(f"%{name}%"),
            )
        )
    if permanent_id:
        stmt = stmt.where(Institution.permanent_id.ilike(f"%{permanent_id}%"))
    if state:
        stmt = stmt.where(Institution.state.ilike(f"%{state}%"))
    if region_id:
        stmt = stmt.where(Institution.region_id == region_id)
    if institution_type:
        stmt = stmt.where(Institution.institution_type == institution_type)
    if is_active is not None:
        stmt = stmt.where(Institution.is_active == is_active)

    total = db.execute(select(func.count()).select_from(stmt.subquery())).scalar_one()
    pages = max(1, math.ceil(total / page_size))
    offset = (page - 1) * page_size

    items = db.execute(
        stmt.order_by(Institution.name).offset(offset).limit(page_size)
    ).scalars().all()

    return items, total, pages


def get_institution_profile(institution_id: uuid.UUID, db: Session) -> Institution:
    """Return institution with eagerly loaded relationships for profile page."""
    return _get_or_404(institution_id, db)


def search_institutions(query: str, db: Session, limit: int = 10) -> List[Institution]:
    """Quick search by name or permanent_id — used for dropdown/autocomplete."""
    stmt = (
        select(Institution)
        .where(
            Institution.is_active == True,
            or_(
                Institution.name.ilike(f"%{query}%"),
                Institution.permanent_id.ilike(f"%{query}%"),
            ),
        )
        .limit(limit)
    )
    return list(db.execute(stmt).scalars().all())


def add_alias(
    *,
    institution_id: uuid.UUID,
    alias_data: InstitutionAliasCreate,
    db: Session,
    actor: Optional[User] = None,
) -> InstitutionAlias:
    _get_or_404(institution_id, db)  # ensure institution exists

    alias = InstitutionAlias(
        institution_id=institution_id,
        **alias_data.model_dump(),
    )
    db.add(alias)
    db.flush()

    log_action(
        entity_type="institution_alias",
        entity_id=alias.id,
        action="alias_added",
        actor=actor,
        new_val={"institution_id": str(institution_id), "alias": alias.alias},
        db=db,
    )
    db.commit()
    db.refresh(alias)
    return alias
