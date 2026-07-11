import sys, traceback
sys.path.insert(0, '.')
from app.database.session import SessionLocal
from app.services.machine_learning.model_training_service import ModelTrainingService
from app.schemas.machine_learning import TrainRequest
from app.models.dataset import Dataset, DatasetMetadata, UploadStatus
from app.models.auth import User
from sqlalchemy import select

db = SessionLocal()

# Get a real user
user = db.execute(select(User).limit(1)).scalar_one_or_none()
if not user:
    print('No user found')
    db.close()
    sys.exit(1)

print(f'Using user: {user.email} (id={user.id})')

# Get a ready dataset belonging to that user
ds = db.execute(
    select(Dataset)
    .where(Dataset.upload_status == UploadStatus.READY)
    .where(Dataset.user_id == str(user.id))
    .limit(1)
).scalar_one_or_none()

if not ds:
    print('No ready dataset found for user')
    db.close()
    sys.exit(1)

print(f'Dataset: {ds.original_filename} (id={ds.id})')
meta = db.query(DatasetMetadata).filter(DatasetMetadata.dataset_id == str(ds.id)).first()
cols = list((meta.detected_columns or {}).keys()) if meta else []
print(f'Columns ({len(cols)}): {cols}')

if len(cols) < 2:
    print('Need at least 2 columns for training')
    db.close()
    sys.exit(1)

target = cols[-1]
features = cols[:-1]

req = TrainRequest(
    dataset_id=str(ds.id),
    model_name='test_lr_model',
    algorithm='linear_regression',
    target_column=target,
    feature_columns=features,
    test_size=0.2,
    random_state=42,
    hyperparameters={}
)

svc = ModelTrainingService(db, str(user.id))
try:
    result = svc.train(req)
    print(f'SUCCESS: model_id={result.id}, status={result.status}')
    print(f'metrics={result.evaluation_summary}')
except Exception as e:
    traceback.print_exc()
    print(f'FAILED: {e}')
finally:
    db.close()
