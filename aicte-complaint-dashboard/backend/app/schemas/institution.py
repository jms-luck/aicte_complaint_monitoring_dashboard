from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field

from app.models.institution import InstitutionType, AliasType


# ── Alias schemas ─────────────────────────────────────────────────────────────

class InstitutionAliasCreate(BaseModel):
    alias: str = Field(..., min_length=1, max_length=500)
    alias_type: AliasType = AliasType.other
    is_primary: bool = False


class InstitutionAliasResponse(BaseModel):
    id: uuid.UUID
    institution_id: uuid.UUID
    alias: str
    alias_type: AliasType
    is_primary: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Institution CRUD schemas ───────────────────────────────────────────────────

class InstitutionCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=500)
    permanent_id: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    district: Optional[str] = Field(None, max_length=100)
    region_id: Optional[uuid.UUID] = None
    institution_type: Optional[InstitutionType] = None
    address: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    pin_code: Optional[str] = Field(None, max_length=20)
    phone: Optional[str] = Field(None, max_length=50)
    email: Optional[str] = Field(None, max_length=255)
    website: Optional[str] = Field(None, max_length=500)
    is_active: bool = True


class InstitutionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=500)
    permanent_id: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    district: Optional[str] = Field(None, max_length=100)
    region_id: Optional[uuid.UUID] = None
    institution_type: Optional[InstitutionType] = None
    address: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    pin_code: Optional[str] = Field(None, max_length=20)
    phone: Optional[str] = Field(None, max_length=50)
    email: Optional[str] = Field(None, max_length=255)
    website: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None


class InstitutionResponse(BaseModel):
    id: uuid.UUID
    permanent_id: Optional[str]
    name: str
    state: Optional[str]
    district: Optional[str]
    region_id: Optional[uuid.UUID]
    institution_type: Optional[InstitutionType]
    address: Optional[str]
    city: Optional[str]
    pin_code: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    website: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    aliases: List[InstitutionAliasResponse] = []

    model_config = {"from_attributes": True}


class InstitutionListResponse(BaseModel):
    id: uuid.UUID
    permanent_id: Optional[str]
    name: str
    state: Optional[str]
    district: Optional[str]
    institution_type: Optional[InstitutionType]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Institution profile (with case statistics) ────────────────────────────────

class BureauCaseSummary(BaseModel):
    bureau_id: uuid.UUID
    bureau_name: str
    bureau_code: str
    total_cases: int
    active_cases: int
    disposed_cases: int


class InstitutionProfile(BaseModel):
    institution: InstitutionResponse
    total_complaints: int
    total_cases: int
    active_cases: int
    overdue_cases: int
    overlap_count: int
    bureau_breakdown: List[BureauCaseSummary] = []
    latest_activity: Optional[datetime] = None


# ── Pagination wrapper ─────────────────────────────────────────────────────────

class PaginatedInstitutions(BaseModel):
    items: List[InstitutionListResponse]
    total: int
    page: int
    page_size: int
    pages: int
