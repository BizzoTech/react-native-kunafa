package com.bizzotech.RNKunafa;

import com.facebook.react.bridge.ReactContext;
import android.content.Context;
import java.lang.reflect.*;

public class StaticValues {
  public static boolean IN_BACKGROUND = true;
	public static ReactContext REACT_CONTEXT = null;

  public static Object getBuildConfigValue(Context context, String fieldName) {
    try {
        Class<?> clazz = Class.forName(context.getPackageName() + ".BuildConfig");
        Field field = clazz.getField(fieldName);
        return field.get(null);
    } catch (ClassNotFoundException e) {
        e.printStackTrace();
    } catch (NoSuchFieldException e) {
        e.printStackTrace();
    } catch (IllegalAccessException e) {
        e.printStackTrace();
    }
    return null;
  }
}
