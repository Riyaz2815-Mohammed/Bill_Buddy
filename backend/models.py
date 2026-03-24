from sqlalchemy import Column, String, Boolean, Date, DateTime, Numeric, Integer, ForeignKey, func, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
import uuid
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone = Column(String(15), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    username = Column(String(50), unique=True, nullable=False)
    avatar_seed = Column(String(100), default="default")
    birthday = Column(Date, nullable=True)
    kyc_verified = Column(Boolean, default=False)
    upi_ids = Column(ARRAY(String), default=list)
    created_at = Column(DateTime, default=func.now())

class Friend(Base):
    __tablename__ = "friends"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    friend_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    created_at = Column(DateTime, default=func.now())

    __table_args__ = (UniqueConstraint('user_id', 'friend_id', name='uq_user_friend'),)

    user = relationship("User", foreign_keys=[user_id])
    friend = relationship("User", foreign_keys=[friend_id])

class Bill(Base):
    __tablename__ = "bills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    total = Column(Numeric(10, 2), nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    status = Column(String(20), default="active")
    qr_code_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now())

    creator = relationship("User", foreign_keys=[created_by])
    items = relationship("BillItem", back_populates="bill", cascade="all, delete")
    members = relationship("BillMember", back_populates="bill", cascade="all, delete")

class BillItem(Base):
    __tablename__ = "bill_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bill_id = Column(UUID(as_uuid=True), ForeignKey("bills.id", ondelete="CASCADE"))
    name = Column(String(200), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, default=1)

    bill = relationship("Bill", back_populates="items")

class BillMember(Base):
    __tablename__ = "bill_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bill_id = Column(UUID(as_uuid=True), ForeignKey("bills.id", ondelete="CASCADE"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    amount_owed = Column(Numeric(10, 2), default=0)
    paid = Column(Boolean, default=False)
    paid_at = Column(DateTime, nullable=True)
    selected_items = Column(ARRAY(UUID(as_uuid=True)), default=list)

    bill = relationship("Bill", back_populates="members")
    user = relationship("User", foreign_keys=[user_id])

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bill_id = Column(UUID(as_uuid=True), ForeignKey("bills.id", ondelete="SET NULL"), nullable=True)
    from_user = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    to_user = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    amount = Column(Numeric(10, 2), nullable=False)
    type = Column(String(20)) # 'paid' or 'received'
    created_at = Column(DateTime, default=func.now())

    sender = relationship("User", foreign_keys=[from_user])
    receiver = relationship("User", foreign_keys=[to_user])
