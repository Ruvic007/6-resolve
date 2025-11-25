import pandas as pd

df= pd.read_csv("consommation_tertiaire_activite.csv")
df["conso_m2"]=df["consommation_declaree"]/df["surface_declaree"]
print (df["conso_m2"].head(5))