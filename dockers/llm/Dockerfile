FROM python:latest

WORKDIR /app/

COPY ./app/main.py /app/
COPY ./app/requirements.txt /app/

RUN pip3 install -r requirements.txt

CMD uvicorn --host=0.0.0.0 --port 8000 main:ap
