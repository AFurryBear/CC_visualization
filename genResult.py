import sys
import nibabel as nib
import numpy as np
import os
import json
fileIN = sys.argv[1]
pathSAVE = sys.argv[2]
pathREF = sys.argv[3]

def check_is_MNI(file):
    a,b = file.header.get_sform(coded=True)
    if b==4:
        return True
    else:
        return False

def ijk2xyz(i, j, k, file):
    M = file.affine[:3, :3]
    abc = file.affine[:3, 3]
    """ Return X, Y, Z coordinates for i, j, k """
    return M.dot([i, j, k]) + abc

def ijk2ijk_07mm(i,j,k,fileIN,fileREF):
    cos = [fileREF.affine[0,0],fileREF.affine[1,1],fileREF.affine[2,2]]
    abc = ijk2xyz(i,j,k,fileIN)-fileREF.affine[:3, 3]
    return [int(round(abc[0]/cos[0])),int(round(abc[1]/cos[1])),int(round(abc[2]/cos[2]))]

def boundary(i,j,k,set,ref):
    if ref:
        set.add(str(i-1).zfill(3)+'_'+str(j).zfill(3)+'_'+str(k).zfill(3))
        set.add(str(i+1).zfill(3)+'_'+str(j).zfill(3)+'_'+str(k).zfill(3))
        set.add(str(i).zfill(3)+'_'+str(j-1).zfill(3)+'_'+str(k).zfill(3))
        set.add(str(i).zfill(3)+'_'+str(j+1).zfill(3)+'_'+str(k).zfill(3))
        set.add(str(i).zfill(3)+'_'+str(j).zfill(3)+'_'+str(k-1).zfill(3))
        set.add(str(i).zfill(3)+'_'+str(j).zfill(3)+'_'+str(k+1).zfill(3))
    set.add(str(i).zfill(3)+'_'+str(j).zfill(3)+'_'+str(k).zfill(3))

def get_boundary(file_IN,ref,file_REF):
    in_Index = np.where(file_IN.get_fdata())
    bound_set = set('s')
    for i in range(len(in_Index[0])):
        li = ijk2ijk_07mm(in_Index[0][i],in_Index[1][i],in_Index[2][i],file_IN,file_REF)
        boundary(int(round(li[0])), int(round(li[1])), int(round(li[2])),bound_set,ref)
    bound_set.remove('s')
    return bound_set

def gen_dic(fileName_MNI):
    a = nib.load(fileName_MNI).get_fdata()[131]
    li_MNI,x_data,y_data =[],[],[]
    for i in range(len(a)):
        x_data.append(i)
        for j in range(len(a[0])):
            li_MNI.append([i,j,a[i,j]])
    for j in range(len(a[0])):
        y_data.append(j)
    data={'x_data':x_data,'y_data':y_data,'data_MNI':li_MNI}
    return data

def process(fileName_In,pathSAVE,pathREF):
    fileName_REF = os.path.join(pathREF,'MNICC07mm_XXmask_final_final.nii')
    fileName_MNI = os.path.join(pathREF,'MNI152_T1_0.7mm.nii.gz')
    file_REF = nib.load(fileName_REF)
    file_IN = nib.load(fileName_In)
    data = gen_dic(fileName_MNI)
    if check_is_MNI(file_IN):
        bound_IN = get_boundary(file_IN,False,file_REF)
        bound_REF = get_boundary(file_REF,True,file_REF)
        bound_TOUGH = get_boundary(file_REF,False,file_REF)
        if len(bound_TOUGH|bound_IN)>0:
            if len(bound_IN-bound_REF)>0:
                print('WARNING: Your mask is bigger than ours! The result may not precise. ')
            texSample = nib.load(os.path.join(pathREF,"Group_result2/part2_result_HCPMMP_homo/118_117_percen_000.tex.gii"))
            for template in ['HCPMMP', 'BN_Atlas','vertice']:
                if template == 'vertice':
                    li,li_CC=[],[]
                    for item in bound_TOUGH|bound_IN:
                        li_CC.append([int(item[4:7]),int(item[8:11]),1])
                        li.append(nib.load(os.path.join(pathREF,"Group_result2/part2_result_" + template +"/" + item[4:11] + "_percen_000.tex.gii")).darrays[0].data)
                    aver_data = np.average(li, axis=0)
                    texSample.darrays[0].data = aver_data.astype('float32')
                    os.system('mkdir -p '+os.path.join(pathSAVE, "part2_result_" + template ))
                    nib.save(texSample, os.path.join(pathSAVE, "part2_result_" + template + "/uploadF_percen_000.tex.gii"))
                    data['data_CC'] = li_CC
                    with open(os.path.join(pathSAVE, 'data.json'), 'w') as f:
                        json.dump(data, f)
                else:
                    for homoSelect in ['homo','noho']:
                        li = []
                        for item in bound_TOUGH|bound_IN:
                            li.append(nib.load(os.path.join(pathREF,"Group_result2/part2_result_" + template + "_"+homoSelect+"/" + item[4:11] + "_percen_000.tex.gii")).darrays[0].data)
                        aver_data = np.average(li, axis=0)
                        texSample.darrays[0].data = aver_data.astype('float32')
                        os.system('mkdir -p '+os.path.join(pathSAVE, "part2_result_" + template + "_"+homoSelect))
                        nib.save(texSample, os.path.join(pathSAVE, "part2_result_" + template + "_"+homoSelect+"/uploadF_percen_000.tex.gii"))
            return "finished!"

        else:
            print('WARNING: There is no intersection!')


if __name__=='__main__':
    process(fileIN,pathSAVE,pathREF)
